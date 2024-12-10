const routers = app => {
    console.log("Routers are all available");

    app.use("/advisory", require("./advisory"))
    app.use("/announcement", require("./announcements"))
    app.use("/auth", require("./auth"))
    app.use("/enrollmentschedule", require("./enrollmentschedule"))
    app.use("/entranceexam", require("./entranceexamstatus"))
    app.use("/event", require("./event"))
    app.use("/examschedule", require("./examschedule"))
    app.use("/gradelevel", require("./gradelevel"))
    app.use("/requirement", require("./requirements"))
    app.use("/schoolyear", require("./schoolyear"))
    app.use("/news", require("./news"))
    app.use("/program", require("./program"))
    app.use("/staffuser", require("./staffuser"))
    app.use("/subject", require("./subject"))
    app.use("/schedule", require("./schedule"))
    app.use("/section", require("./section"))
    app.use("/studentuser", require("./studentuser"))
    app.use("/ticketuser", require("./ticketuser"))
    
    app.use("/uploads", require("./upload"))
}

module.exports = routers