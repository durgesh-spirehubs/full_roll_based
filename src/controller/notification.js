
import { Op } from "sequelize";
import db from "../models/index.js";
const {Notifications,Users}=db;

export const createNotification = async (payload) => {
  try {
    console.log(payload);
    let data = await Notifications.create({
      title: payload.title,
      subtitle: payload.subtitle,
      userId: payload.userId,
      status: false,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateStatusNotification = async (req, res, next) => {
  try {
    let data = await Notifications.update(
      {
        status: req.body.status,
      },
      {
        where: { id: req.params.id },
      }
    );
    res.status(200).json({
      message: "successful update",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
    });
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    let data = await Notifications.update(
      {
        status: req.body.status,
      },
      {
        where: { userId: req.user.id },
      }
    );
    res.status(200).json({
      message: "successful update",
      data: data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const getNotification = async (req, res, next) => {
  try {
    let query = {where:{}};
    let limit = req.query?.limit ? Number(req.query.limit) : 2;
    if (req.query?.page) {
      (query["limit"] = limit),
        (query["offset"] = (Number(req.query.page) - 1) * limit);
    }
    let order = req.query?.order ? req.query?.order : "desc";
    if (req.query?.orderBy) {
      query["order"] = [[req.query.orderBy, order]];
    } else {
      query["order"] = [["id", order]];
    }
    if (req.query?.search) {
        query.where[Op.or] = [
          { userId: { [Op.like]: `%${req.query.search}%` } },
          { title: { [Op.like]: `%${req.query.search}%` } },
          { subtitle: { [Op.like]: `%${req.query.search}%` } },
        ];
      }
     if (req.body?.id) {
      query.where.userId = req.body.id;
    }
    let data = await Notification.findAndCountAll(query);
    res.status(200).json({
      messge: "list of notification",
      total: data.count,
      data: data.rows,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteNotification = async (req, res, next) => {
  try {
    let data = await Notifications.destroy({ where: { id: req.params.id } });
    if (!data) {
      return res.status(400).json({
        message: "fail to delete notification",
      });
    }
    res.status(200).json({
      message: "notification deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "error occur",
    });
  }
};
