import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/user";

export async function GET(request: Request) {
  await dbConnect();
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

  try {
    const foundUser = await UserModel.findById(user._id).select("messages");
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const messages = [...(foundUser.messages || [])].sort(
      (a, b) =>
        new Date(String(b.createdAt)).getTime() -
        new Date(String(a.createdAt)).getTime(),
    );

    return Response.json(
      {
        success: true,
        messages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching messages", error);
    return Response.json(
      {
        success: false,
        message: "Error fetching messages",
      },
      { status: 500 },
    );
  }
}
