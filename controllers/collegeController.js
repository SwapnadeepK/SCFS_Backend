const { createCollegeService, getCollegesService } = require("../services/userService.js");
const {
    getAllColleges,
    getDepartmentsByCollege,
    getDegreesByDepartment
} = require("../models/collegeModel.js");

const createCollege = async (req, res) => {
    try {
        const data = req.body;

        await createCollegeService(data);

        res.status(201).json({ message: "College created" });
    } catch (err) {
        res.status(500).json({ message: "Error creating college" });
    }
};

const getColleges = async (req, res) => {
    try {
        const colleges = await getCollegesService();
        res.json(colleges);
    } catch (err) {
        res.status(500).json({ message: "Error fetching colleges" });
    }
};

const getCollegesDropdown = async (req, res) => {
    const data = await getAllColleges();
    res.json(data);
};

const getDepartments = async (req, res) => {
    const data = await getDepartmentsByCollege(req.params.collegeId);
    res.json(data);
};

const getDegrees = async (req, res) => {
    const { collegeId, departmentId } = req.params;
    const data = await getDegreesByDepartment(collegeId, departmentId);
    res.json(data);
};

module.exports = { createCollege, getColleges, getCollegesDropdown, getDepartments, getDegrees };