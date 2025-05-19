import type { NextApiRequest, NextApiResponse } from "next";
import Todo from "../../models/todo";
import dbConnect from "../../db";

// interface ITodo {
//   name: string
//   isCompleted: boolean
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET": {
      try {
        const todos = await Todo.find({});
        res.status(200).json(todos);
      } catch (error) {
        res.status(500).json({ message: "Error fetching todos" });
      }
      break;
    }

    case "POST": {
      try {
        const { name, isCompleted } = req.body;
        const created = await Todo.create({ name, isCompleted });
        res.status(201).json(created);
      } catch (error) {
        res.status(500).json({ message: "Error creating todo" });
      }
      break;
    }

    case "PUT": {
      try {
        const { _id, name, isCompleted } = req.body;
        console.log(
          `Updating todo: _id=${_id}, newName=${name}, isCompleted=${isCompleted}`
        );
        const updated = await Todo.findByIdAndUpdate(
          _id,
          { name, isCompleted },
          { new: true }
        );
        console.log(`After update, isCompleted: ${updated?.isCompleted}`);
        res.status(201).json(updated);
      } catch (error) {
        res.status(500).json({ message: "Error updating todo" });
      }
      break;
    }

    case "DELETE": {
      try {
        const { _id } = req.body;
        const deleted = await Todo.findByIdAndDelete(_id);
        res.status(200).json(deleted || { message: "Todo not found" });
      } catch (error) {
        res.status(500).json({ message: "Error creating todo" });
      }
      break;
    }

    default: {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} not allowed` });
    }
  }
}
