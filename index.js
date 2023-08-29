import "dotenv/config";
import OpenAI from "openai";
import * as fs from "node:fs";

const openai = new OpenAI({
    apiKey: process.env.API_KEY
})


const readFilesFromFolder = (folder) => {
    const fileContents = []
    fs.readdirSync(folder).forEach((filePath) => {
        fileContents.push(fs.readFileSync("./" + folder + "/" + filePath).toString('utf8'));
    })
    return fileContents;
}

const writeResultFile = (fileName, content) => {
    fs.writeFileSync("./results/" + fileName, content)
};

const main = async () => {
    const fileContents = readFilesFromFolder("./files")
    for (const fileContent of fileContents) {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: `Generate unit tests for the following Java class:\n\`\`\`${fileContent}\`\`\`\n Use junit and mockito and create only one case per method. I want you to respond only with Java code, avoid sentences, lists and markdown.`}],
            model: "gpt-3.5-turbo-16k",
            temperature: 0.2
        })

        const response = completion.choices[0].message.content;
        const startOfClassName = response.indexOf("class ") + "class ".length;
        const endOfClassName = response.indexOf(" ", startOfClassName)
        const className = response.substring(startOfClassName, endOfClassName)
        console.log(`Writing ${className} file...`)
        writeResultFile(className + ".java", response)
    }
}

main()
