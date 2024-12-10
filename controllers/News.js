const { default: mongoose } = require("mongoose")
const News = require("../models/News")


exports.createnews = async (req, res) => {
    const { id, username } = req.user
    const { title, content } = req.body

    if(!title || !content){
        return res.status(400).json({ message: "failed", data: "Please input title and content."})
    }
    let image
    if(req.file){
        image = req.file.path
    } else {
        return res.status(400).json({ message: "failed", data: "Please upload a image."})
    }
    

    await News.create({
        owner: id,
        title: title,
        content: content,
        image: image
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating news. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.editnews = async (req, res) => {
    const { id, username } = req.user
    const { title, content, news } = req.body

    if(!news){
        return res.status(400).json({ message: "failed", data: "Please select an news to edit."})
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
    

    await News.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(news)},{
        $set: {
            owner: id,
            title: title,
            content: content,
            image: image
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while editing news. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.deletenews = async (req, res) => {
    const { id, username } = req.user
    const { news } = req.query

    if(!news){
        return res.status(400).json({ message: "failed", data: "Please select a news to delete."})
    }

    await News.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(news)},{
        $set: {
            status: "inactive"
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting news. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getnews = async (req, res) => {
    const { page, limit } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }


    const newslist  = await News.find({ status: "active" })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({createdAt: -1})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching news data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    })

    const totalPages = await News.countDocuments()
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count news document. error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const finaldata = {
        totalpages: pages,
        data: []
    }

    newslist.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            title: temp.title,
            content: temp.content,
            image: temp.image,
            createdAt: temp.createdAt
        })
    })

    return res.status(200).json({ message: "success", data: finaldata })
}


