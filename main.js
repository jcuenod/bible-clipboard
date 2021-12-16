require('isomorphic-fetch')
const wrap = require('wordwrap')(60)
const referenceParser = require('referenceparser').default
const rp = new referenceParser()

const wordArrayToString = (wordArray) => wordArray.map(w => `${w.text}${w.trailer}`).join("")
const wrapAndIndent = (text) => wrap(text).replace(/\n/g, "\n    ")

const modulesToString = (modules) => `
NET:
    ${wrapAndIndent(modules.find(m => m.module_id === 4).text_as_html_string.replace(/<br \/>/g, "\n"))}
JPS: 
    ${wrapAndIndent(modules.find(m => m.module_id === 3).text_as_html_string.replace(/<br \/>/g, "\n"))}
BHSA:
    ${wrapAndIndent(wordArrayToString(modules.find(m => m.module_id === 7).text_as_word_array))}


`

const ClipboardListener = require('clipboard-listener')

const listener = new ClipboardListener({
    timeInterval: 100, // Default to 250
    immediate: true, // Default to false
})

listener.on('change', async value => {
    const ref = rp.parse(value)
    if (ref.book && ref.chapter && ref.verse) {
        console.log(ref)
        const refString = `${ref.book} ${ref.chapter}:${ref.verse} `
        const r = await (await fetch(`http://localhost:3000/api/v2/text?modules=jps,net,etcbc+bhsa&reference=${refString}`)).json()
        console.log(modulesToString(r.data[0].modules))
    }
    else {
        console.log('Not a reference')
    }
})
