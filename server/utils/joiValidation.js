import Joi from "joi";

// ============================
// VALIDATION SCHEMAS
// ============================

// Register validation schema
const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name must be at most 50 characters",
            "any.required": "Name is required",
        }),

    email: Joi.string()
        .trim()
        .email()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),


    password: Joi.string()
        .min(6)
        .max(100)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password must be at most 100 characters",
            "any.required": "Password is required",
        }),

});

// Login validation schema
const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .email()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required",
        }),
});

const profileSchema = Joi.object({
    age: Joi.number()
        .integer()
        .min(0)
        .max(120)
        .messages({
            "number.base": "Age must be a number",
            "number.integer": "Age must be a whole number",
            "number.min": "Age cannot be negative",
            "number.max": "Age cannot be greater than 120",
        }),

    gender: Joi.string()
        .valid("Male", "Female", "Other")
        .messages({
            "any.only": "Gender must be Male, Female, or Other",
        }),

    medicalHistory: Joi.array()
        .items(Joi.string().trim().min(1).messages({ "string.empty": "Medical history entries cannot be empty" })),

    allergies: Joi.array()
        .items(Joi.string().trim().min(1).messages({ "string.empty": "Allergy entries cannot be empty" })),

    medications: Joi.array()
        .items(Joi.string().trim().min(1).messages({ "string.empty": "Medication entries cannot be empty" })),
}).min(1);

const chatSchema = Joi.object({
    consultationId: Joi.string()
        .trim()
        .length(24)
        .hex()
        .required()
        .messages({
            "string.empty": "consultationId is required",
            "string.length": "consultationId must be a valid 24-char ObjectId",
            "string.hex": "consultationId must be a valid ObjectId",
            "any.required": "consultationId is required",
        }),

    message: Joi.string()
        .trim()
        .min(1)
        .max(4000)
        .required()
        .messages({
            "string.empty": "message is required",
            "string.min": "message cannot be empty",
            "string.max": "message is too long",
            "any.required": "message is required",
        }),
});

const consultationChatBodySchema = Joi.object({
    message: Joi.string()
        .trim()
        .min(1)
        .max(4000)
        .required()
        .messages({
            "string.empty": "message is required",
            "string.min": "message cannot be empty",
            "string.max": "message is too long",
            "any.required": "message is required",
        }),
});



const consultationSchema = Joi.object({
    mainSymptom: Joi.array()
        .items(Joi.string().trim().min(1).messages({ "string.empty": "Symptom cannot be empty" }))
        .min(1)
        .required()
        .messages({
            "array.base": "mainSymptom must be an array",
            "array.min": "At least one symptom is required",
            "any.required": "mainSymptom is required",
        }),

    symptomDuration: Joi.string()
        .trim()
        .min(1)
        .max(120)
        .required()
        .messages({
            "string.empty": "symptomDuration is required",
            "string.min": "symptomDuration is too short",
            "string.max": "symptomDuration is too long",
            "any.required": "symptomDuration is required",
        }),

    notes: Joi.string()
        .trim()
        .allow("")
        .max(2000)
        .messages({
            "string.max": "notes is too long",
        }),

    gender: Joi.string()
        .valid("Male", "Female", "Other")
        .messages({
            "any.only": "gender must be Male, Female, or Other",
        }),

    age: Joi.number()
        .integer()
        .min(0)
        .max(120)
        .messages({
            "number.base": "age must be a number",
            "number.integer": "age must be a whole number",
            "number.min": "age cannot be negative",
            "number.max": "age cannot be greater than 120",
        }),

    height: Joi.number()
        .min(30)
        .max(300)
        .messages({
            "number.base": "height must be a number",
            "number.min": "height must be at least 30 cm",
            "number.max": "height must be at most 300 cm",
        }),

    weight: Joi.number()
        .min(1)
        .max(500)
        .messages({
            "number.base": "weight must be a number",
            "number.min": "weight must be at least 1 kg",
            "number.max": "weight must be at most 500 kg",
        }),
});


// VALIDATION MIDDLEWARES
/**
 * Generic validation middleware factory
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {string} property - Property of req to validate (default: 'body')
 */
const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown keys from the validated data
        });

        if (error) {
            // Format error messages
            const errorMessages = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errorMessages,
            });
        }
        // Replace request body/property with validated and sanitized data
        req[property] = value;
        next();
    };
};

// EXPORTED MIDDLEWARE FUNCTIONS
export const registerValidation = validate(registerSchema);
export const loginValidation = validate(loginSchema);
export const createProfileValidation = validate(profileSchema);
export const updateProfileValidation = validate(profileSchema);
export const chatValidation = validate(chatSchema);
export const createConsultationValidation = validate(consultationSchema);
export const consultationChatValidation = validate(consultationChatBodySchema);

export default validate;