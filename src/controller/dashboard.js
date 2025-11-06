import { Op, fn, col, where } from "sequelize";
import moment from "moment";
import db from "../models/index.js";
const {Leads}=db;
function getFirstAndLastDayOfMonth2(startDate) {
  let currentDate = new Date(startDate);
  const result = [];
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  result.push({
    firstDay: firstDay.toISOString().split("T")[0],
    lastDay: lastDay.toISOString().split("T")[0],
  });

  return result;
}
export const datafilter = async (req, res, next) => {
  try {
    const filter = req.query.filter;
    let startDate, endDate;
    if (filter == "week") {
      startDate = moment().startOf("week").toDate();
      endDate = moment().endOf("week").toDate();
    } else if (filter == "month") {
      startDate = moment().startOf("month").toDate();
      endDate = moment().endOf("month").toDate();
    } else {
      startDate = moment().startOf("year").toDate();
      endDate = moment().endOf("year").toDate();
    }
    let data = await Leads.findAll({
      attributes: [
        [fn("DATE", col("createdAt")), "createdDate"],
        [fn("COUNT", col("id")), "LeadCount"],
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [fn("DATE", col("createdAt"))],
    });
    if (!data) {
      return res.status(404).json({
        message: "No data found",
      });
    }
    return res.status(200).json({
      message: "data found",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const dashboardfilterLead = async (req, res, next) => {
  const finalData = {
    leads: {
      totalLead: 0,
      labels: [],
      series: [{ name: "leads", data: [] }],
    },
  };
  try {
    if (req.query?.type === "weekly") {
      let leadsum = 0;
      for (let index = 6; index >= 0; index--) {
        const currentDate = moment();
        const endDate = currentDate.subtract(index, "days");
        const start = endDate.clone().utc().format("Y-MM-DD");
        const label = `${start}`;
        const leadcount = await Leads.count({
          where: {
            type: "Lead",
            [Op.and]: [where(fn("DATE", col("createdAt")), "=", start)],
          },
        });
        leadsum += leadcount;
        finalData.leads.totalLead = leadsum;
        finalData.leads.labels.push(label);
        finalData.leads.series[0].data.push(leadcount);
      }
    }
    if (req.query?.type === "monthly") {
      let leadsum = 0;
      for (let index = 29; index >= 0; index--) {
        const currentDate = moment();
        const endDate = currentDate.subtract(index, "days");
        const start = endDate.clone().utc().format("Y-MM-DD");
        const label = `${start}`;
        const leadcount = await Leads.count({
          where: {
            type: "Lead",
            [Op.and]: [where(fn("DATE", col("createdAt")), "=", start)],
          },
        });
        leadsum += leadcount;
        finalData.leads.totalLead = leadsum;
        finalData.leads.labels.push(label);
        finalData.leads.series[0].data.push(leadcount);
      }
    }
    if (req.query?.type === "yearly") {
      let leadsum = 0;
      for (let index = 12; index >= 0; index--) {
        let currentDate = moment();
        const endDate = currentDate.subtract(index, "month");
        let data = getFirstAndLastDayOfMonth2(endDate);
        if (index == 0) {
          data[0].lastDay = endDate.clone().utc().format("Y-MM-DD");
        }
        let label = `${data[0].firstDay}-${data[0].lastDay}`;
        const leadcount = await Leads.count({
          where: {
            type: "Lead",
            [Op.and]: [
              where(fn("DATE", col("createdAt")), ">=", data[0]?.firstDay),
              where(fn("DATE", col("createdAt")), "<=", data[0]?.lastDay),
            ],
          },
        });
        leadsum += leadcount;
        finalData.leads.totalLead = leadsum;
        finalData.leads.labels.push(label);
        finalData.leads.series[0].data.push(leadcount);
      }
    }
    res.status(200).json({
      message: "success",
      data: finalData,
    });
  } catch (error) {
    next(error);
  }
};
export const dashboardata = async (req, res, next) => {
  try {
    const allleadcount = await Leads.count({
      where: {
        status: "Active",
        type: "Lead",
      },
    });
    const allinquirycount = await Leads.count({
      where: {
        status: "Active",
        type: "Inquiry",
      },
    });
    const finaldata = {
      leadCount: allleadcount || 0,
      inquirydata: allinquirycount || 0,
    };
    res.status(200).json({
      message: "successful get dashboard data",
      data: finaldata,
    });
  } catch (error) {
    next(error);
  }
};
