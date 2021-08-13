import { Request, Response } from "express";
import validate from "validate.js";
import { resData, resError } from "../Helpers/tools";
import { prisma } from "../index";
import { User } from "./types";

export default class InvoiceController {
  static async makeInvoices(req, res: Response): Promise<object> {
    const body = req.body;
    const user: User = req.user;

    const valid = validate.isArray(body.items);
    if (!valid) return resError(res, "invalid body");
    let items: Array<number> = [];

    body.items.forEach((item) => {
      items.push(item.id);
    });

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items,
        },
      },
    });

    let total = 0;
    let productsToCreate = [];

    for (let product of products) {
      productsToCreate.push({
        subTotal:
          parseInt(product.price) *
          body.items.filter((e) => e.id == product.id)[0].amount,
        amount: body.items.filter((e) => e.id == product.id)[0].amount,
        product: {
          connect: { id: product.id },
        },
      });

      total =
        total +
        parseInt(product.price) *
          body.items.filter((e) => e.id == product.id)[0].amount;
    }

    try {
      const invoice = await prisma.invoice.create({
        include: { invoiceItems: true },
        data: {
          total,
          user: { connect: { id: user.id } },
          invoiceItems: {
            create: productsToCreate,
          },
        },
      });
      return resData(res, invoice);
    } catch (error) {
      console.log(error);
      return resError(res, "Error Occured");
    }
  }

  static async getInvoice(req: Request, res: Response): Promise<object> {
    let id = parseInt(req.params.id);

    try {
      let invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { invoiceItems: true },
      });
      if (invoice) return resData(res, invoice);
      return resError(res, "not found");
    } catch (error) {
      console.log(error);
      return resError(res, "Error Occured");
    }
  }

  static async getAll(req: Request, res: Response): Promise<object> {
    const invoices = await prisma.invoice.findMany({
      include: { invoiceItems: { include: { product: true } } },
    });

    return resData(res, invoices);
  }

  static async getByUser(req, res: Response): Promise<object> {
    try {
      const user: any = await prisma.user.findMany({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          invoices: {
            include: { invoiceItems: { include: { product: true } } },
          },
        },
      });

      if (user) return resData(res, user);
      return resError(res, "No Invoices Found");
    } catch (error) {
      console.log(error);
      return resError(res, "Error Occured");
    }
  }
}
