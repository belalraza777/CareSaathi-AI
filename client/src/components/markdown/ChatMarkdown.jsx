import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
    // Keep users in chat context while allowing docs to open safely.
    a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
};

function ChatMarkdown({ content }) {
    return (
        <div className="chat-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {String(content || "")}
            </ReactMarkdown>
        </div>
    );
}

export default ChatMarkdown;
