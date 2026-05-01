import { z } from "zod";

export const FieldSchema = z.object({
  name: z.string(),
  type: z.enum(["String", "Number", "Boolean", "Date"]),
  required: z.boolean().optional().default(true),
});

export const ModelSchema = z.object({
  name: z.string().describe("PascalCase name of the model, e.g., User, Task, Post"),
  fields: z.array(FieldSchema),
});

export const ProjectSchema = z.object({
  projectName: z.string(),
  models: z.array(ModelSchema),
});

export const GenerateRequestSchema = z.object({
  prompt: z.string().min(3),
});
