const StaffUsers = require("../models/Staffusers");
const { default: mongoose } = require("mongoose");
const Ticketcounter = require("../models/Ticketcounter");
const Studentusers = require("../models/Studentusers"); // Import the Studentusers model
const Gradelevel = require("../models/gradelevel");
const Program = require("../models/Program");
const EnrollmentFee = require("../models/Enrollmentfee");
const GradingPeriod = require("../models/Gradingperiod");

exports.initialize = async () => {

    // Initialize the superadmin account if it doesn't exist
    const admin = await StaffUsers.find({ auth: "superadmin" })
        .then(data => data)
        .catch(err => {
            console.log(`Error finding the admin data: ${err}`);
            return;
        });

    if (admin.length <= 0) {
        await StaffUsers.create({
            username: "SchoolSuperadmin",
            password: "LKOHosadIoDKO",
            webtoken: "",
            status: "active",
            auth: "superadmin"
        }).catch(err => {
            console.log(`Error saving admin data: ${err}`);
            return;
        });
    }

    // Initialize the ticket user counter if it doesn't exist
    const existingTicketCounter = await Ticketcounter.find({ name: "ticketUserCounter" })
        .then(data => data)
        .catch(err => {
            console.log(`Error finding the ticket counter data: ${err}`);
            return;
        });

    if (existingTicketCounter.length <= 0) {
        await Ticketcounter.create({ name: "ticketUserCounter", value: 0 })
            .catch(err => {
                console.log(`Error saving ticket counter data: ${err}`);
                return;
            });
    }

    // Initialize the student user counter if it doesn't exist
    const existingStudentCounter = await Ticketcounter.find({ name: "studentUserCounter" })
        .then(data => data)
        .catch(err => {
            console.log(`Error finding the student counter data: ${err}`);
            return;
        });

    if (existingStudentCounter.length <= 0) {
        await Ticketcounter.create({ name: "studentUserCounter", value: 0 })
            .catch(err => {
                console.log(`Error saving student counter data: ${err}`);
                return;
            });
    }

    const existingProgramYearLevel = await Program.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for existing program year level in initialization. Error: ${err}`)
        return;
    })
    if(existingProgramYearLevel.length <= 0){
        const programs = [
            { name: "Nursery" },
            { name: "Pre-school" },
            { name: "Elementary" },
            { name: "Junior High-School" },
            { name: "Senior High-School" },
          ];
      
          const createdPrograms = await Program.insertMany(programs);
          console.log("Programs initialized!");
      
          const programMap = createdPrograms.reduce((map, program) => {
            map[program.name] = program._id;
            return map;
          }, {});
      
          const gradeLevels = [
            { level: "Pre-Nursery", program: programMap["Nursery"] },
            { level: "Nursery", program: programMap["Nursery"] },
      
            { level: "Pre-kindergarten", program: programMap["Pre-school"] },
            { level: "Kindergarten 1", program: programMap["Pre-school"] },
            { level: "Kindergarten 2", program: programMap["Pre-school"] },
      
            { level: "Grade 1", program: programMap["Elementary"] },
            { level: "Grade 2", program: programMap["Elementary"] },
            { level: "Grade 3", program: programMap["Elementary"] },
            { level: "Grade 4", program: programMap["Elementary"] },
            { level: "Grade 5", program: programMap["Elementary"] },
            { level: "Grade 6", program: programMap["Elementary"] },
      
            { level: "Grade 7", program:  programMap["Junior High-School"] },
            { level: "Grade 8", program:  programMap["Junior High-School"] },
            { level: "Grade 9", program:  programMap["Junior High-School"] },
            { level: "Grade 10", program: programMap["Junior High-School"] },
      
            { level: "Grade 11", program: programMap["Senior High-School"] },
      
            { level: "Grade 12", program: programMap["Senior High-School"] },
          ];


          const createdGradeLevels = await Gradelevel.insertMany(gradeLevels);
          console.log("Grade levels initialized!");
  
          for (const grade of createdGradeLevels) {
              await EnrollmentFee.create({
                  gradelevel: grade._id, 
                  program: grade.program, 
              });
          }
        console.log("Enrollment fee data initialized!");
    }


    const isGradingPeriod = await GradingPeriod.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for existing Grading Period in initialization. Error: ${err}`)
        return;
    })


    if(isGradingPeriod.length <= 0){
        await GradingPeriod.create({
            quarter: "Q1"
        })

        console.log("Grading Period initialized")
    }

    console.log("SERVER DATA INITIALIZED");
};
