import db from "../models/index.js";
const {Users,Roles,Departments}=db;
import bcrypt from "bcrypt";

export const createStaff = async (req, res, next) => {
  try {
    if (!req.user.hasAccess("Staff-write")) {
      return res.status(403).json({ message: "access denied" });
    }
    const { name, email, role_id ,password} = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }
    if (req.user.user_type !== "Admin") {
      return res.status(403).json({ message: "Only admin can create staff" });
    }
    const hashpassword=await bcrypt.hash(password,10);
    const newStaffData = {
      name,
      email,
      user_type: "Staff",
      role_id: role_id || 3,
      status: true,
      password:hashpassword,
      createdAt: new Date(),
    };
    const newUser = await Users.create(newStaffData);
    res.status(200).json({
      message: "Staff created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res,next) => {
  try{
  if (!req.user.hasAccess("Staff-all")) {
    return res.status(403).json({
      message: "forbidden error",
    });
  }
  const userId=req.params.id;
  const {name,email,password,role_id}=req.body;
  const updateData={
    name,
    email,
    role_id,
    updatedAt:new Date()
  }
  const updateUser=await Users.update(updateData,{
    where:{id:userId,user_type:"Staff"}
  });

  if(!updateUser){
    return res.status(404).json({
      status:"error",
      message:"unsuccessful to update"

    })
  }
   res.status(200).json({
      message:"Staff details updated successfully",
      data:updateUser
    })

}
catch(error){
  next(error)
}
}
export const deleteStaff = async (req, res, next) => {
  try {
    if (!req.user.hasAccess("Staff-all")) {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      });
    }
    const userId = req.params.id;
    const deletedCount = await Users.destroy({
      where: { id: userId, user_type: "Staff" },
    });
    if (deletedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Staff not found or already deleted",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getallStaff = async (req, res,next) => {
  if (!req.user.hasAccess("Staff-read")) {
    return res.status(403).json({
      message: "staff get",
    });
  }
  let query={};
  try{
     query["where"]={id:req.params.id};
     query["attributes"]=[
      "id",
      "name",
      "email",
      "user_type"
     ];
     query["include"]=[
      {
        model:Roles,
        as:"role",
        attributes:["id","roleName","accessID"]
      }
     ];

     let data=await Users.findOne(query);
     if(!data){
      return res.status(404).json({
        status:"data not found",
      })
     }
     res.status(200).send({
      status:"success",
      data
     })
  }
  catch(error){
    next(error)
  }
}

