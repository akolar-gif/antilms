"use server";

import { promises as fs } from "fs";
import path from "path";

export async function uploadImageAction(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file uploaded.");
  }

  // Ensure it's an image
  if (!file.type.startsWith("image/")) {
    throw new Error("Only images are allowed.");
  }

  // Generate unique filename
  const extension = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`;
  
  // Save to public/uploads or process.env.UPLOAD_DIR
  const uploadDir = process.env.UPLOAD_DIR 
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads");

  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, filename);
  
  // Read file data
  const buffer = Buffer.from(await file.arrayBuffer());
  
  await fs.writeFile(filePath, buffer);
  
  // Return public URL path (always routed through next.js or served statically)
  return `/uploads/${filename}`;
}

export async function uploadAudioAction(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file uploaded.");
  }

  // Ensure it's an audio file
  if (!file.type.startsWith("audio/")) {
    throw new Error("Only audio files are allowed.");
  }

  // Generate unique filename
  const extension = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`;
  
  // Save to public/uploads or process.env.UPLOAD_DIR
  const uploadDir = process.env.UPLOAD_DIR 
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads");

  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, filename);
  
  // Read file data
  const buffer = Buffer.from(await file.arrayBuffer());
  
  await fs.writeFile(filePath, buffer);
  
  // Return public URL path
  return `/uploads/${filename}`;
}

export async function uploadVideoAction(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file uploaded.");
  }

  // Ensure it's a video file
  if (!file.type.startsWith("video/")) {
    throw new Error("Only video files are allowed.");
  }

  // Generate unique filename
  const extension = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`;
  
  // Save to public/uploads or process.env.UPLOAD_DIR
  const uploadDir = process.env.UPLOAD_DIR 
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads");

  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, filename);
  
  // Read file data
  const buffer = Buffer.from(await file.arrayBuffer());
  
  await fs.writeFile(filePath, buffer);
  
  // Return public URL path
  return `/uploads/${filename}`;
}

