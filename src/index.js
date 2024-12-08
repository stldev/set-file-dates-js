import { execSync } from 'node:child_process';
import path from 'node:path';
import * as url from 'url';
import sgMail from '@sendgrid/mail';
import {
    startingPath,
    debug,
    batchLogAmount,
    sendGridKey,
    emailTo,
    emailFrom,
    runAllTasks,
} from '../config.js';
import { convert } from './heic-convert.js';
import { getFiles } from './utils.js';

const extensionsImg = ['.jpg', '.jpeg', '.heic'];
const extensionsVid = ['.3gp', '.mov', '.mp4'];
let counter = 0;
let progress = '';

sgMail.setApiKey(sendGridKey);

async function main() {
    console.time('ALL_TASKS');
    const startTime = new Date().toLocaleString();
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    console.log(`===== STARTING_PATH ===== ${startingPath}`);

    console.time('HEIC_CONVERT');
    for await (const f of getFiles(startingPath)) {
        const fExtension = f.substring(f.lastIndexOf('.'), f.length);

        if (fExtension === '.heic') {
            const lastSlash = f.lastIndexOf('\\');
            const fileDir = f.substring(0, lastSlash);
            const fileName = f.substring(lastSlash + 1, f.length);
            await convert(fileDir, fileName.split('.')[0]);
        }
    }
    console.timeEnd('HEIC_CONVERT');

    if (runAllTasks) {
        console.time('SET_DATETIME');
        for await (const f of getFiles(startingPath)) {
            counter += 1;
            const fExtension = f.substring(f.lastIndexOf('.'), f.length);
            const isValid = [...extensionsImg, ...extensionsVid].includes(
                fExtension
            );

            if (isValid) {
                const lastSlash = f.lastIndexOf('\\');
                const fileDir = f.substring(0, lastSlash);
                const fileName = f.substring(lastSlash + 1, f.length);
                const propertyNumber = extensionsImg.includes(fExtension)
                    ? 12
                    : 208;

                const first4 = fileName.substring(0, 4);
                const middle2 = fileName.substring(4, 6);
                const last2 = fileName.substring(6, 8);

                const dateFromFileName = new Date(
                    Number(first4),
                    Number(middle2) - 1,
                    Number(last2),
                    10,
                    10,
                    10
                );

                let scriptArgs = `-filedir "${fileDir}" -filename "${fileName}" -propnumber ${propertyNumber} -debug ${debug}`;

                if (!isNaN(dateFromFileName.getTime())) {
                    const fileNameDateIso = dateFromFileName.toISOString();
                    scriptArgs += ` -filenamedate "${fileNameDateIso}"`;
                }

                const scriptPath = path.join(__dirname, './set-file-props.ps1');
                execSync(`${scriptPath} ${scriptArgs}`, {
                    stdio: 'inherit',
                    encoding: 'utf-8',
                    shell: 'powershell',
                });
            }

            if (counter % batchLogAmount === 0) {
                progress += '.';
                console.log(`[${counter}]${progress}`);
            }
        }
        console.timeEnd('SET_DATETIME');
    }

    await sgMail.send({
        from: emailFrom,
        to: emailTo,
        subject: 'Files all processed',
        html: `StartingPath: ${startingPath}.<hr>Total files processed: ${counter}.<hr>Started at: ${startTime}.`,
    });

    console.timeEnd('ALL_TASKS');
}

main()
    .then(() => console.log('done!'))
    .catch((err) => console.log('ERR', err))
    .finally(() => process.exit());
