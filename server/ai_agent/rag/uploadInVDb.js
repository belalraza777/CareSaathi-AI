import * as dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { HuggingFaceInferenceEmbeddings }
    from "@langchain/community/embeddings/hf";
import { Pinecone } from "@pinecone-database/pinecone";
import { randomUUID } from 'node:crypto';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Utility function to sanitize metadata for Pinecone storage.
function toPineconeMetadata(metadata = {}) {
    const sanitized = {};

    for (const [key, value] of Object.entries(metadata)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            sanitized[key] = value;
            continue;
        }
        if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
            sanitized[key] = value;
            continue;
        }
        if (value !== undefined && value !== null) {
            sanitized[key] = JSON.stringify(value);
        }
    }

    return sanitized;
}

function normalizePdfText(text = "") {
    return String(text)
        .replace(/\u00ad/g, "")
        .replace(/\r/g, "\n")
        .replace(/\t+/g, " ")
        .replace(/[|]{2,}/g, " ")
        .replace(/[_]{3,}|[-]{3,}/g, " ")
        .replace(/\s*\n\s*/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ ]{2,}/g, " ")
        .trim();
}

function isLowSignalChunk(text) {
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return true;

    const shortLines = lines.filter((line) => line.length < 4).length;
    const digitHeavyLines = lines.filter((line) => {
        const alnum = (line.match(/[a-z0-9]/gi) || []).length;
        const digits = (line.match(/\d/g) || []).length;
        return alnum > 0 ? digits / alnum > 0.55 : false;
    }).length;
    const symbolHeavyLines = lines.filter((line) => {
        const symbols = (line.match(/[^a-z0-9\s]/gi) || []).length;
        return line.length > 0 ? symbols / line.length > 0.35 : false;
    }).length;

    const noisyRatio = (shortLines + digitHeavyLines + symbolHeavyLines) / lines.length;
    return noisyRatio > 0.7;
}

// Main function to process PDF and store in Pinecone vector database.
async function pdfIntoVDB() {
    try {
        // Step 1: Load the source PDF.
        const PDF_PATH = path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            './standard-treatment-guidelines_.pdf'
        );
        const pdfBaseName = path.basename(PDF_PATH, path.extname(PDF_PATH));
        const pdfFileName = path.basename(PDF_PATH);

        const loader = new PDFLoader(PDF_PATH);
        const rawDocs = await loader.load();
        console.log("Raw docs:", rawDocs.length);

        // Step 2: Split raw documents into smaller chunks.
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 600, // Adjust chunk size as needed.
            chunkOverlap: 200, // Adjust chunk size and overlap as needed.
        });

        const chunkedDocs = await splitter.splitDocuments(rawDocs);

        // Step 3: Clean and filter chunks automatically.
        const minChunkLength = Number(process.env.MIN_CHUNK_LENGTH || 20);
        const validDocs = chunkedDocs
            .map((doc, i) => {
                // Remove common table/diagram artifacts so retrieval favors natural medical text.
                const pageContent = normalizePdfText(doc.pageContent || "");
                return {
                    ...doc,
                    pageContent,
                    metadata: {
                        ...doc.metadata,
                        source: doc.metadata?.source || pdfFileName,
                        chunkId: String(doc.metadata?.chunkId ?? i),
                        charCount: pageContent.length,
                    },
                };
            })
            .filter((doc) => doc.pageContent.length >= minChunkLength)
            .filter((doc) => !isLowSignalChunk(doc.pageContent));

        console.log("Valid docs:", validDocs.length);

        if (!validDocs.length) {
            throw new Error("No valid content");
        }

        // Step 4: Validate required API keys.
        if (!process.env.HF_API_KEY) {
            throw new Error("HF_API_KEY is missing in .env");
        }
        if (!process.env.PINECONE_API_KEY) {
            throw new Error("PINECONE_API_KEY is missing in .env");
        }

        // Step 5: Initialize embedding model.
        const embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: process.env.HF_API_KEY,
            model: "sentence-transformers/all-MiniLM-L6-v2",
        });


        // Step 6: Initialize Pinecone client and target index.
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const indexName = process.env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX_NAME || `${pdfBaseName}-index`;
        const namespace = process.env.PINECONE_NAMESPACE || `${pdfBaseName}-pdf`;

        // Step 7: Check if the index exists, if not create it (idempotent).
        try {
            await pc.describeIndex(indexName);
        } catch (error) {
            console.log(`Index '${indexName}' not found. Creating...`);
        }

        const index = pc.index(indexName);

        // Step 8: Generate embeddings for all valid chunks.
        const texts = validDocs.map(doc => doc.pageContent);
        const embeddingList = await embeddings.embedDocuments(texts);

        // Step 9: Build Pinecone records with automatic IDs and metadata.
        const records = validDocs.map((doc, idx) => ({
            id: randomUUID(), // Auto-generate a unique ID for each vector record.
            values: embeddingList[idx],
            metadata: {
                ...toPineconeMetadata(doc.metadata),
                source: doc.metadata?.source || pdfFileName,
                chunkId: String(doc.metadata?.chunkId ?? idx),
                text: doc.pageContent,
            },
        }));

        // Step 10: Upsert records to Pinecone in batches to stay under payload limits.
        const batchSize = Number(process.env.PINECONE_UPSERT_BATCH_SIZE || 100);
        console.log("Upserting", records.length, "records...");
        const namespacedIndex = index.namespace(namespace); // Reuse namespace-scoped index for all batches.
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await namespacedIndex.upsert(batch);
            console.log(`Upserted ${Math.min(i + batch.length, records.length)}/${records.length}`);
        }

        console.log(`Stored ${records.length} vectors in Pinecone index '${indexName}' namespace '${namespace}'`);

    } catch (err) {
        console.error("Pipeline failed:", err);
    }
}

pdfIntoVDB();