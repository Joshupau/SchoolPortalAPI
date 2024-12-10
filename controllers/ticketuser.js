const { default: mongoose } = require("mongoose")
const Ticketusers = require("../models/Ticketusers")




exports.getTicketuserinfo = async (req, res) => {
    const { id } = req.user
    

    const matchConditionPipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "requirements",
                localField: "requirements",
                foreignField: "_id",
                as: "requirements"
            }
        },
        {
            $unwind: {
                path: "$requirements",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                fullname: {
                    $concat: [
                            "$requirements.firstname",
                            " ",
                            "$requirements.middlename",
                            " ",
                            "$requirements.lastname"
                        ]
                }
            }
        }
    ]


    const userData = await Ticketusers.aggregate(matchConditionPipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching ticket user info. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with your account. Please contact admin for more details."})
    })

    console.log(userData)

    return res.status(200).json({ message: "success", data: userData})
}