import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";


const changeAvailablity = async(req, res) => {

    try {

        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available});
        res.json({ success: true, message: 'Availablity Changed'})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}


const doctorList = async(req, res) => {

    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email']);

        res.json({success: true, doctors});

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}

// API for doctor login
// controller/doctorController.js

const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the doctor
        const doctor = await doctorModel.findOne({ email });

        // 2. If doctor is not found, exit early
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found with this email",
            });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, doctor.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }

        // 4. Generate JWT token
        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        // 5. Send success response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        });
    }
};


// API to get doctors appointments for doctor panel
const appointmentsDoctor = async(req, res) => {

    try {
        
        const { doctorId } = req.body;
        const appointments = await appointmentModel.find({ doctorId });

        res.json({success: true, appointments})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async(req,res) => {
    try {
        
        const { doctorId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.doctorId === doctorId) {

            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true});
            return res.json({ success: true, message: 'Appointment Completed'});

        } 
        else {
            return res.json({ success: false, message: 'Mark Failed'});
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}

// API to cancel appointment completed for doctor panel
const appointmentCancel = async(req,res) => {
    try {
        
        const { doctorId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.doctorId === doctorId) {

            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true});
            return res.json({ success: true, message: 'Appointment Cancelled'});

        } 
        else {
            return res.json({ success: false, message: 'Cancellation Failed'});
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async(req, res) => {
    try {
        
        const { doctorId } = req.body;

        const appointments = await appointmentModel.find({doctorId});

        let earnings = 0;

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
        })

        let patients = [];

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success: true, dashData});

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}

// API to get doctor profile for Doctor Panel
const doctorProfile = async(req, res) => {

    try {
        
        const { doctorId } = req.body;
        const profileData = await doctorModel.findById(doctorId).select('-password');

        console.log(profileData);

        res.json({success: true, profileData})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async(req, res) => {
    
    try {
        
        const { doctorId, fees, address, available }  = req.body;

        await doctorModel.findByIdAndUpdate(doctorId, { fees, address, available});

        res.json({ success: true, message: 'Profile Updated'});

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message});
    }
}

export { changeAvailablity, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile };