import UserModel from "@/app/model/user";
import dbConnect from "@/app/lib/dbConnect";
import { messageSchema } from "@/app/schemas/messageSchema";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = await request.json();

    const result = messageSchema.safeParse({ content });
    if (!result.success) {
      return Response.json(
        {
          success: false,
          message:
            result.error.format().content?._errors.join(", ") ||
            "Invalid message content",
        },
        { status: 400 },
      );
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 },
      );
    }

    const newMessage = { content: result.data.content, createdAt: new Date() };
    (user.messages as any[]).push(newMessage);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending message", error);
    return Response.json(
      {
        success: false,
        message: "Error sending message",
      },
      { status: 500 },
    );
  }
}
