import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/user";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { _id?: string } | undefined;

    if (!session || !user?._id) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageid");

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid message id",
        },
        { status: 400 },
      );
    }

    const result = await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(user._id) },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageId) } } },
    );

    if (result.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found",
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting message", error);
    return Response.json(
      {
        success: false,
        message: "Error deleting message",
      },
      { status: 500 },
    );
  }
}
