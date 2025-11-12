import { Op } from "sequelize";
import { assignLead } from "./lead.js";
import { createNotification } from "./notification.js";
import db from "../models/index.js";
const  {Users,Roles,Departments,Leads,Assignusers,Histories}=db;
export const createInquiry = async (req, res, next) => {
  try {
    req.body.type = "Inquiry";
    req.body.createdAt = new Date();
    console.log(req.user.id);
    const payload={
      title:req.body.type,
      subtitle:"Notification",
      userId:req.user.id,
    }
    const createInquiry = await Leads.create(req.body);
      console.log(payload)
   const data=await  createNotification(payload);
    res.status(201).json({
      message: "successful inquiry created",
      createInquiry: createInquiry,
      notificationdata:data
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const updateInquiry = async (req, res, next) => {
  try {
    if (!req.user.hasAccess("Inquiry-write")) {
      res.status(200).json({
        message: "Permission not allowed to update",
      });
    }
    let data = req.body;
    req.body.updatedBy = req.user.id;
    req.body.updatedAt = new Date();
    const updateData = await Leads.update(data, {
      where: { id: req.params.id },
    });
    res.status(200).json({
      message: "succesful inquiry update the data",
      updateInquiry: updateData,
    });
  } catch (error) {
    next(error);
  }
};
export const assignInquiry = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const inquiryData = await Leads.findOne({
      where: { id: req.params.id },
      attributes: ["id"],
    });
    if (!inquiryData) {
      return res.status(404).json({
        message: "No inquiry data found",
      });
    }
    const staffData = await Users.findOne({
      where: { id: req.body.assignStaff },
      attributes: ["id", "name"],
    });
    if (!staffData) {
      return res.status(404).json({
        message: "assign staff not found",
      });
    }
    const newData = {
      leadId: req.params.id,
      userId: req.body.assignStaff,
      assignStatus: "assigned",
      createdBy: req.user.id,
      createdAt: new Date(),
    };
    const db = {
      leadId: req.params.id,
      userId: req.body.assignStaff,
      comment: `Inquiery assigned to ${staffData.name}`,
      type: "Inquiry",
      createdBy: req.user.id,
      createdAt: new Date(),
      status: "Active",
    };
    const inquerydata = await Assignusers.findOne({
      where: {
        leadId: req.params.id,
        userId: req.body.assignStaff,
      },
      attributes: ["id"],
    });
    if (inquerydata) {
      return res.status(400).json({
        message: "lead already assign",
      });
    }
    const assignUser = await Assignusers.create(newData);
    await Histories.create(db);
    return res.status(200).json({
      message: "successful inquiry assigned",
      data: assignUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const bulkinquire = async (req, res, next) => {
  try {
    if (!req.body?.id || !req.body?.assignStaffId) {
      return res.status(400).json({
        message: "error occured",
      });
    }
    for (let inquireid = 0; inquireid < req.body.id.length; inquireid++) {
      for (
        let staffid = 0;
        staffid < req.body.assignStaffId.length;
        staffid++
      ) {
        const data = await Assignusers.findOne({
          where: {
            leadId: req.body.id[inquireid],
            userId: req.body.assignStaffId[staffid],
          },
        });
        if (data) {
          const newData = {
            leadId: req.body.id[inquireid],
            userId: req.body.assignStaffId[staffid],
            updatedBy: req.user.id,
            updatedAt: new Date(),
          };
          const updatedata = await Assignusers.update(newData, {
            where: {
              leadId: req.body.id[inquireid],
              userId: req.body.assignStaffId[staffid],
            },
          });
        } else {
          const data = await Assignusers.create({
            leadId: req.body.id[inquireid],
            userId: req.body.assignStaffId[staffid],
            assignStatus: "assigned",
            createdBy: req.user.id,
            createdAt: new Date(),
          });
          const staffData = await Users.findOne({
            where: { id: req.body.assignStaffId[staffid] },
            attributes: ["id", "name"],
          });
          const db = {
            leadId: req.body.id[inquireid],
            userId: req.body.assignStaffId[staffid],
            comment: `Inquiery assigned to ${staffData.name}`,
            type: "Inquiry",
            createdBy: req.user.id,
            createdAt: new Date(),
            status: "Active",
          };
          const history = await Histories.create(db);
        }
      }
    }
    return res.status(200).json({
      message: "assigning inquiry in bulk done",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const getInquiry = async (req, res, next) => {
  try {
    let query = {};
    const limit = req.query?.limit ? Number(req.query.limit) : 5;
    if (req.query?.page) {
      query["limit"] = limit;
      query["offset"] = (Number(req.query.page) - 1) * limit;
    }
    const order = req.query?.order ? req.query.order : "desc";
    if (req.query?.orderbys) {
      query["order"] = [[req.query.orderbys, order]];
    } else {
      query["order"] = [["name", order]];
    }
    query["where"] = {
      status: {
        [Op.in]: ["Active", "InActive"],
      },
      type: "Inquiry",
    };
    if (req.query?.search) {
      const search = req.query?.search;
      query["where"][Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
      ];
    }
    const assingUser={
        model:Assignusers,
        as: "assignUserList",
        attributes:["id","leadId","userId"],
        include:{
          model:Leads,
          as:"leadDetail",
          attributes:["name"]
        },
        // include:{
        //     model:USERS,
        //     as:"userDetail",
        //     attributes:["id","name","user_type"]
        // }
    }
    query["include"]=[assingUser];
    query["attributes"]=["id","name","companyName","status","type","description"];
    const data = await Leads.findAndCountAll(query);
    return res.status(200).json({
      message: "sucesss",
      total: data.count,
      data: data.rows,
    });
  } catch (error) {
    next(error);
  }
};
export const unassignInquiry = async (req, res, next) => {
  try {
    const assignInquiry = await Assignusers.findOne({
      where: { id: req.params.id },
      attributes: ["id", "leadId", "userId"],
    });
    if (!assignInquiry) {
      return res.status(404).json({
        message: "assign inquiry not found",
      });
    }
    const inquirylead = await Leads.findOne({
      where: { id: assignInquiry.leadId },
      attributes: ["id"],
    });
    if (!inquirylead) {
      return res.status(404).json({
        message: "inquirylead not found",
      });
    }
    const staffdata = await Users.findOne({
      where: { id: assignInquiry.userId },
      user_type: "Staff",
    });

    if (!staffdata) {
      return res.status(404).json({
        message: "staff data not found",
      });
    }
    const updatedata={
        status:"InActive",
        updateBy:req.user.id,
        updatedAt:new Date()
    }
    const deletedata = await Assignusers.update(updatedata,{
      where: { id: req.params.id },
    });
    const db = {
      leadId: inquirylead.id,
      userId: staffdata.id,
      comment: `Inquiery un-assigned to ${staffdata.name}`,
      type: null,
      createdBy: req.user.id,
      createdAt: new Date(),
      status: "InActive",
    };
    await Histories.create(db);
    return res.status(200).json({
      message: "successfully inquiry un-assigned",
    });
  } catch (error) {
    next(error);
  }
};
export const converttolead = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(404).json({
        message: "id not passed",
      });
    }
    const leaddata = await Leads.findOne({
      where: { id: req.params.id },
    });
    if (!leaddata) {
      return res.status(400).json({
        message: "lead data not found",
      });
    }
    if (leaddata.type == "Lead") {
      return res.status(409).json({
        message: "lead already present",
      });
    }
    const data = await Leads.update(
      { type: "Lead" },
      { where: { id: req.params.id } }
    );
    return res.status(200).json({
      message: "convert to lead",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};
