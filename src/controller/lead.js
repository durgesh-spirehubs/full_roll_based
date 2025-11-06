import { Op } from "sequelize";
import db from "../models/index.js";
const {Users,Leads,Assignusers,Histories,Departments}=db;
export const createLead = async (req, res, next) => {
  try {
    req.body.createdAt = new Date();
    req.body.type = "Lead";
    const createlead = await Leads.create(req.body);
    res.status(200).json({
      message: "Inquiry created",
      data: createlead,
    });
  } catch (error) {
    next(error);
  }
};
export const updateLead = async (req, res, next) => {
  try {
    let data = req.body;
    req.body.updatedBy = req.user.id;
    req.body.updateAt = new Date();
    let updateData = await Leads.update(data, {
      where: { id: req.params.id },
    });
    res.status(200).json({
      message: "successful update data",
      data: updateData,
    });
  } catch (error) {
    next(error);
  }
};

export const assignLead = async (req, res, next) => {
  try {
    const findleadData = await Leads.findOne({
      where: { id: req.params.id },
      attributes: ["id"],
    });
    if (!findleadData) {
      return res.status(404).json({
        message: "lead data not found",
      });
    }
    const findassignstaff = await Users.findOne({
      where: { id: req.body.assignStaff },
      attributes: ["id","name"],
    });
    if (!findassignstaff) {
      return res.status(404).json({
        message: "Assign staff not found",
      });
    }
    const newData = {
      leadId: req.params.id,
      userId: req.body.assignStaff,
      assignStatus: "assigned",
      createdBy: req.user.id,
      createdAt: new Date(),
    };
    const findData = await Assignusers.findOne({
      where: {
        leadId: req.params.id,
        userId: req.body?.assignStaff,
      },
    });
    if (findData) {
      return res.status(403).json({
        message: "lead already sign",
      });
    }
    const assignUser = await Assignusers.create(newData);
    if(assignUser){
      const db = {
        leadId: req.params.id,
        userId: findassignstaff.id,
        comment: `Lead assigned to ${findassignstaff.name}`,
        type: "Lead",
        createdBy: req.user.id,
        createdAt: new Date(),
        status: "Active",
      };
      await Histories.create(db);
    }
    return res.status(200).json({
      message: "lead assign",
      data: assignUser,
    });
  } catch (error) {
    next(error);
  }
};
export const unassignlead = async (req, res, next) => {
  try {
    const newdata = await Assignusers.findOne({
      where: { id: req.params.id },
    });
    if (!newdata) {
      return res.status(404).json({
        message: "assign lead not found",
      });
    }
    const leaddata = await Leads.findOne({
      where: { id: newdata.leadId },
      attributes: ["id"],
    });
    if (!leaddata) {
      return res.status(404).json({
        message: "lead data not found",
      });
    }
    const userData = await Users.findOne({
      where: { id: newdata.userId, user_type: "Staff" },
      attributes: ["id","name"],
    });
    if (!userData) {
      return res.status(404).json({
        message: "User data not found",
      });
    }
    const unassignlead = await Assignusers.destroy({
      where: { id: req.params.id },
    });
    if (!unassignlead) {
      return res.status(404).json({
        message: "no assign lead found ",
      });
    }
    const db = {
      leadId: leaddata.id,
      userId: userData.id,
      comment: `Lead un-assigned to ${userData.name}`,
      type: null,
      createdBy: req.user.id,
      createdAt: new Date(),
      status: "InActive",
    };
    await Histories.create(db);
    res.status(200).json({
      message: "successfully unassign lead",
    });
  } catch (error) {
    next(error);
  }
};
export const getLeads = async (req, res, next) => {
  try {
    let query = {};
    const limit = req.query?.limit ? Number(req.query.limit) : 5;
    if (req.query?.page) {
      query["limit"] = limit;
      query["offset"] = (Number(req.query.page) - 1) * limit;
    }
    let order = req.query?.order || "desc";
    query["where"] = {
      [Op.and]: [
        { status: { [Op.in]: ["Active", "InActive"] } },
        { type: "Lead" },
      ],
    };
    if (req.query?.search) {
      const searchTerm = req.query.search.trim();
      const searchTerms = searchTerm.split(" ");
      let searchCondition;
      if (searchTerms.length > 1) {
        searchCondition = {
          [Op.and]: searchTerms.map((term) => ({
            [Op.or]: [
              { name: { [Op.like]: `%${term}%` } },
              { companyname: { [Op.like]: `%${term}%` } },
              { status: { [Op.like]: `%${term}%` } },
            ],
          })),
        };
      } else {
        searchCondition = {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { companyname: { [Op.like]: `%${searchTerm}%` } },
            { status: { [Op.like]: `%${searchTerm}%` } },
          ],
        };
      }
      query["where"][Op.and].push(searchCondition);
    }
    const assignInclude = {
      model: Assignusers,
      as: "assignUserList",
      attributes: ["id", "leadId", "userId", "type"],
      include: [
        {
          model: Users,
          as: "userDetail",
          attributes: ["id", "name"],
        },
      ],
    };
    if (req?.query?.assignStaff) {
      assignInclude.where = {
        userId: req.query.assignStaff,
      };
    }
    query["include"] = [assignInclude];
    query["attributes"] = ["id", "name", "companyname", "status"];
    const data = await Leads.findAndCountAll(query);
    return res.status(200).json({
      status: "success",
      message: "",
      total: data.count,
      data: data.rows,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteinquiry = async (req, res, next) => {
  try {
    if (!req.user.hasAccess("Inquiry-all")) {
      return res.status(403).json({
        message: "permission not allowed to delete",
      });
    }
    const deleteinquiry = await Leads.destroy({
      where: { id: req.params.id },
    });
    if (!deleteinquiry) {
      return res.status(400).message({
        message: "not able to delete data",
      });
    }
    res.status(200).json({
      message: "successful deleted inquiry",
    });
  } catch (error) {
    next(error);
  }
};
