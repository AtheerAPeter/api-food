import { Request, Response } from "express";
import { prisma } from "../index";
import { paginate, parseErrors, resData, resError } from "../Helpers/tools";
import Validator from "../Helpers/validators";
import validate from "validate.js";
import { User, Product } from "./types";

export default class ProductController {
  static async getAll(req, res: Response): Promise<object> {
    const { p, s, q } = req.query;
    const { skip, take } = await paginate(p, s);

    try {
      // client.get("products", (error, data) => {
      //   if (error) console.log("redis", error);
      //   if (data != null) return resData(res, JSON.parse(data));
      // });
      let products = await prisma.product.findMany({
        skip,
        take,
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        orderBy: {
          id: "desc",
        },
        include: {
          addedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              password: false,
              active: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          editedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              password: false,
              active: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      // client.setex("products", 3600, JSON.stringify(products));

      return resData(res, products);
    } catch (error) {
      console.log(error);
      return resError(res, "Error Occured");
    }
  }
  static async getAllForUser(req, res: Response): Promise<object> {
    const { p, s, q } = req.query;
    const { skip, take } = await paginate(p, s);

    try {
      const count = await prisma.product.count();
      let products = await prisma.product.findMany({
        skip,
        take,
        where: {
          name: { contains: q, mode: "insensitive" },
          active: true,
        },
        orderBy: {
          id: "desc",
        },
      });
      return resData(res, { products, count });
    } catch (error) {
      console.log(error);
      return resError(res, "Error Occured");
    }
  }
  static async addOne(req, res: Response): Promise<object> {
    const body = req.body;
    const admin = req.admin;

    const invalid = validate(body, Validator.product());

    if (invalid) return resError(res, parseErrors(invalid));
    try {
      const product: Product = await prisma.product.create({
        data: { addedBy: { connect: { id: admin.id } }, ...body },
        include: {
          addedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              password: false,
              active: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          editedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              password: false,
              active: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return resData(res, product);
    } catch (error) {
      console.log("================================");
      console.log(error);
      console.log("================================");

      return resError(res, "Error Occured");
    }
  }
  static async getOne(req: Request, res: Response): Promise<object> {
    const id = parseInt(req.params.id);
    try {
      const product: Product = await prisma.product.findUnique({
        where: { id },
      });

      if (product) return resData(res, product);
      return resError(res, "not found");
    } catch (error) {
      console.log(error);
      return resError(res, "Error Occured");
    }
  }
  static async update(req, res: Response): Promise<object> {
    const body = req.body;
    const admin = req.admin;

    const invalid = validate(body, Validator.product(false));
    const id = Number(req.params.id);
    if (invalid) return resError(res, parseErrors(invalid));
    try {
      const exist = await prisma.product.findFirst({ where: { id } });
      if (!!exist) {
        const product = await prisma.product.update({
          where: {
            id,
          },
          data: {
            editedBy: { connect: { id: admin.id } },
            ...body,
          },
        });

        if (product) return resData(res, product);
        return resError(res, "error occured");
      } else {
        return resError(res, `Product with id ${id} does not exist`);
      }
    } catch (error) {
      console.log(error);
      return resError(res, "error occured");
    }
  }
}
