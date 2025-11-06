
import { Op, fn, col } from "sequelize";
import db from "../models/index.js";
const {Users,Attendances}=db;
export const clockIn = async (req, res, next) => {
  try {
    let data = await Attendances.create({
      userId: req.user.id,
      createdBy: req.user.id,
      createdAt: new Date(),
      clockIn: new Date().toTimeString().split(" ")[0],
      date: new Date(),
    });
    res.status(200).json({
      message: "successful attendance marked",
      data: data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const clockOut = async (req, res, next) => {
  try {
    console.log(req.params.id);
    let [data] = await Attendances.update(
      {
        updatedBy: req.user.id,
        clockOut: new Date().toTimeString().split(" ")[0],
        date: new Date(),
      },
      {
        where: { id: req.params.id,userId: req.user.id },
      }
    );
    if (data == 0) {
      res.status(200).json({
        message: "success data not found",
        data: data,
      });
    }
    res.status(200).json({
      message: "successful logout",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};
export const getAttendance = async (req, res, next) => {
  try {
    let query = {};
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
    query["include"] = {
      model: USERS,
      as: "userDetail",
      attributes: ["id", "name", "email"],
    };
    query["attributes"] = [
      "id",
      "clockIn",
      "clockOut",
      "date",
      [fn("TIMEDIFF", col("clockOut"), col("clockIn")), "totaltime"],
    ];
    console.log("query", query);
    const data = await Attendances.findAndCountAll(query);
    if (!data) {
      res.status(404).json({
        message: "no data found",
      });
    }
    res.status(200).json({
      message: "found data",
      total: data.count,
      data: data.rows,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const totaltimehour = async (req, res, next) => {
  try {
    const timedata = await Attendances.findAll({
      attributes: [
        "id",
        "clockIn",
        "clockOut",
        [fn("TIMEDIFF", col("clockOut"), col("clockIn")), "ShiftTime"],
      ],
      where: { date: req.query.date, userId: req.user.id },
    });
    const total=await Attendances.findOne({
      attributes:[
          [fn("SEC_TO_TIME",fn("SUM",fn("TIME_TO_SEC",fn("TIMEDIFF",col("clockOut"),col("clockIn"))))),"TotalActiveTime"]
      ],
      where: { date: req.query.date, userId: req.user.id },
      raw:true
    })
    res.status(200).json({
      message: "time calculated by user",
      totaltime:total.TotalActiveTime,
      data:timedata
    });
  } catch (error) {
    next(error);
  }
};
export const deleteAttendance = async (req, res, next) => {
  try {
    const [data] = await Attendances.update(
      {
        status: "InActive",
      },
      { where: { id: req.params.id } }
    );
    if (data == 0) {
      res.status(404).json({
        message: "deleted data not found",
      });
    }
    res.status(200).json({
      message: "data deleted successful",
    });
  } catch (error) {
    next(error);
  }
};
