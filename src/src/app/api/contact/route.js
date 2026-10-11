import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, email, phone, country } = await req.json();

    if (!name || !email || !country) {
      return NextResponse.json({ error: "Name, Email, and Country are required" }, { status: 400 });
    }

    const newContact = await prisma.contact.create({
      data: { name, email, phone, country },
    });

    return NextResponse.json({ message: "Contact saved successfully", contact: newContact }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save contact" }, { status: 500 });
  }
}
