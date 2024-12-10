const { default: mongoose } = require("mongoose")
const Events = require("../models/Events")

exports.createevent = async (req, res) => {
    const { id, username } = req.user
    const { title, content, eventdate } = req.body

    if(!title || !content){
        return res.status(400).json({ message: "failed", data: "Please input title and content."})
    }
    let image
    if(req.file){
        image = req.file.path
    } else {
        return res.status(400).json({ message: "failed", data: "Please upload a image."})
    }
    

    await Events.create({
        owner: id,
        title: title,
        content: content,
        image: image,
        eventdate: eventdate
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating events. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.editevent = async (req, res) => {
    const { id, username } = req.user
    const { title, content, event, eventdate } = req.body

    if(!event){
        return res.status(400).json({ message: "failed", data: "Please select an event to edit."})
    }

    if(!title || !content){
        return res.status(400).json({ message: "failed", data: "Please input title and content."})
    }
    let image
    if(req.file){
        image = req.file.path
    } else {
        return res.status(400).json({ message: "failed", data: "Please upload a image."})
    }
    

    await Events.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(event)},{
        $set: {
            owner: id,
            title: title,
            content: content,
            image: image,
            eventdate: eventdate
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while editing events. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.deleteevent = async (req, res) => {
    const { id, username } = req.user
    const { event } = req.query

    if(!event){
        return res.status(400).json({ message: "failed", data: "Please select an event to delete."})
    }

    await Events.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(event)},{
        $set: {
            status: "inactive"
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting events. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getevents = async (req, res) => {
    const { page, limit } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }


    const eventlist  = await Events.find({ status: "active" })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({createdAt: -1})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching events data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    })

    const totalPages = await Events.countDocuments()
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count event document. error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const finaldata = {
        totalpages: pages,
        data: []
    }

    eventlist.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            title: temp.title,
            content: temp.content,
            image: temp.image,
            eventdate: temp.eventdate,
            createdAt: temp.createdAt
        })
    })

    return res.status(200).json({ message: "success", data: finaldata })
}


