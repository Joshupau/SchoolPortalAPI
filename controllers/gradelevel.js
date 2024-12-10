const { default: mongoose } = require("mongoose")
const Gradelevel = require("../models/gradelevel")


exports.getAllGradelevels = async (req, res) => {
    const gradeLevelData = await Gradelevel.find({ status: "active" })
       .sort({ level: 1 })
      .then(data => data)
      .catch(err => {
         console.log(`There's a problem encountered while fetching Grade Level data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
    })
    if(!gradeLevelData){
        return res.status(400).json({ message: "failed", data: "No existing grade level data."})
    }

    const sortedData = gradeLevelData.sort((a, b) => {
        const isKindergartenA = a.level.toLowerCase().includes("kindergarten");
        const isKindergartenB = b.level.toLowerCase().includes("kindergarten");
    
        if (isKindergartenA && !isKindergartenB) {
            return -1; 
        }
        if (!isKindergartenA && isKindergartenB) {
            return 1; 
        }
    
        const levelA = a.level.match(/(\d+)/) ? parseInt(a.level.match(/(\d+)/)[0], 10) : 0;
        const levelB = b.level.match(/(\d+)/) ? parseInt(b.level.match(/(\d+)/)[0], 10) : 0;
        
        return levelA - levelB;
    });
    
    const finaldata = []

    sortedData.forEach(temp => {
        finaldata.push({
            id: temp._id,
            level: temp.level,
            program: temp.program,
            status: temp.status,
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})    
}

exports.creategradelevel = async (req, res) => {
    const data = req.body.data

    console.log(data)
    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "failed", data: "Please select a program and input grade level name." })
    }

     await Promise.all(data.map(async (item) => {
        if (!item.program || !item.name) {
            throw new Error("Please provide both program and grade level name for each entry.");
        }

        return await Gradelevel.create({
            program: new mongoose.Types.ObjectId(item.program),
            level: item.name,
        });
    }))
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating grade level. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.editgradelevel = async (req, res) => {
    const { gradelevel,program, name } = req.body

    if(!gradelevel || !program || !name){
        return res.status(400).json({ message: "failed", data: "Please select a program and input a new grade level name." })
    }

    await Gradelevel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(gradelevel)}, { $set: { program: new mongoose.Types.ObjectId(program), level: name}})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating grade level. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.deletegradelevel = async (req, res) => {
    const { gradelevel  } = req.query

    if(!gradelevel){
        return res.status(400).json({ message: "failed", data: "Please select a grade level to delete." })
    }

    await Gradelevel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(gradelevel)}, { $set: { status: "inactive" }})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating grade level. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.gradelevellist = async (req, res) => {
    const { page, limit, search, filter } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    }

    let searchMatchStage = {};
    if (search) {
        searchMatchStage = {
            $or: [
                { level: { $regex: search, $options: 'i' } },
                { "programDetails.name": { $regex: search, $options: 'i' } },
            ],        
        };
    }

    const matchconditionpipeline = [
        ...(filter ? [{ $match: { status: filter } }] : []), 
        {
            $lookup: {
                from: "programs", 
                localField: "program", 
                foreignField: "_id",   
                as: "programDetails", 
            },
        },
        {
            $unwind: "$programDetails",
        },
        ...(search ? [{ $match: searchMatchStage }] : []),  
        { $sort: { "programDetails.name": 1, level: 1 } }, 
        { $skip: pageOptions.page * pageOptions.limit },     
        { $limit: pageOptions.limit },                    
    ];

    const gradelevellist = await Gradelevel.aggregate(matchconditionpipeline)
    .then(data => data)
    .catch( err => {
        console.log(`There's a problem encountered while fetching grade level list. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    })

    if (gradelevellist.length <= 0){
        return res.json({message: "success", data: {
            data: [],
            totalpages: 0
        }})
    }

    const countPipeline = [
        ...(filter ? [{ $match: { status: filter } }] : []), 
        {
            $lookup: {
                from: "programs", 
                localField: "program", 
                foreignField: "_id",   
                as: "programDetails", 
            },
        },
        {
            $unwind: "$programDetails",
        },
        ...(search ? [{ $match: searchMatchStage }] : []),  
        { $count: "totalDocuments" }
    ];
    const totalDocuments = await Gradelevel.aggregate(countPipeline)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem encountered while fetching grade level list total documents. Error: ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details" });
        });


    const pages = Math.ceil(totalDocuments[0].totalDocuments / pageOptions.limit)

    const finaldata = {
        totalPages: pages,
        data: []
    }

    const sortedData = gradelevellist.sort((a, b) => {
        const isKindergartenA = a.level.toLowerCase().includes("kindergarten");
        const isKindergartenB = b.level.toLowerCase().includes("kindergarten");
    
        if (isKindergartenA && !isKindergartenB) {
            return -1; 
        }
        if (!isKindergartenA && isKindergartenB) {
            return 1; 
        }
    
        const levelA = a.level.match(/(\d+)/) ? parseInt(a.level.match(/(\d+)/)[0], 10) : 0;
        const levelB = b.level.match(/(\d+)/) ? parseInt(b.level.match(/(\d+)/)[0], 10) : 0;
        
        return levelA - levelB;
    });

    sortedData.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            programid: temp.program,
            program: temp.programDetails.name,
            level: temp.level,
            status: temp.status,
            createdAt: temp.createdAt
        })
    })

    return res.status(200).json({ message: "success", data: finaldata })
}

exports.getGradeLevelByProgram = async (req, res) => {
    const { program } = req.query;

    // Construct query based on the presence of the `program` parameter
    const query = { status: "active" };
    if (program) {
        query.program = new mongoose.Types.ObjectId(program);
    }

    const gradeLevelData = await Gradelevel.find(query)
        .sort({ level: 1 })
        .then(data => data)
        .catch(err => {
            console.log(
                `There's a problem encountered while fetching Grade Level data. Error: ${err}`
            );
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact admin for more details.",
            });
        });

    if (!gradeLevelData || gradeLevelData.length === 0) {
        return res.status(400).json({
            message: "failed",
            data: "No existing grade level data.",
        });
    }

    // Sort data to prioritize kindergarten levels
    const sortedData = gradeLevelData.sort((a, b) => {
        const isKindergartenA = a.level.toLowerCase().includes("kindergarten");
        const isKindergartenB = b.level.toLowerCase().includes("kindergarten");

        if (isKindergartenA && !isKindergartenB) {
            return -1;
        }
        if (!isKindergartenA && isKindergartenB) {
            return 1;
        }

        const levelA = a.level.match(/(\d+)/)
            ? parseInt(a.level.match(/(\d+)/)[0], 10)
            : 0;
        const levelB = b.level.match(/(\d+)/)
            ? parseInt(b.level.match(/(\d+)/)[0], 10)
            : 0;

        return levelA - levelB;
    });

    // Format the final data
    const finalData = sortedData.map((temp) => ({
        id: temp._id,
        level: temp.level,
        program: temp.program,
        status: temp.status,
    }));

    return res.status(200).json({ message: "success", data: finalData });
};
