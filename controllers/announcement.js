const { default: mongoose } = require("mongoose")
const Announcements = require("../models/Announcement")

exports.createannouncement = async (req, res) => {
    const { id, username } = req.user
    const { title, content, writer } = req.body

    if(!title || !content){
        return res.status(400).json({ message: "failed", data: "Please input title and content."})
    }
    let image
    if(req.file){
        image = req.file.path
    } 

    await Announcements.create({
        owner: id,
        title: title,
        content: content,
        image: image,
        writer: writer,
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating announcements. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.editannouncement = async (req, res) => {
    const { id, username } = req.user
    const { title, content, writer, announcement } = req.body

    if(!announcement){
        return res.status(400).json({ message: "failed", data: "Please select an announcement to edit."})
    }

    if(!title || !content){
        return res.status(400).json({ message: "failed", data: "Please input title and content."})
    }
    let image
    if(req.file){
        image = req.file.path
    } 

    await Announcements.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(announcement)},{
        $set: {
            owner: id,
            title: title,
            content: content,
            image: image,
            writer: writer,
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while editing announcements. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.deleteannouncement = async (req, res) => {
    const { id, username } = req.user
    const { announcement } = req.query

    if(!announcement){
        return res.status(400).json({ message: "failed", data: "Please select an announcement to delete."})
    }

    await Announcements.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(announcement)},{
        $set: {
            status: "inactive"
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting announcements. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getannouncement = async (req, res) => {
    const { page, limit } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }


    const announcementlist  = await Announcements.find({ status: "active" })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({createdAt: -1})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching announcements data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    })

    const totalPages = await Announcements.countDocuments()
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count announcements document. error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const finaldata = {
        totalpages: pages,
        data: []
    }

    announcementlist.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            title: temp.title,
            content: temp.content,
            image: temp.image,
            createdAt: temp.createdAt,
            writer: temp.writer
        })
    })

    return res.status(200).json({ message: "success", data: finaldata })
}

