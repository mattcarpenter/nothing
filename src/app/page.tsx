import { Inter } from 'next/font/google'
import fs from 'fs';
import _ from 'lodash';
import { Viewer, Differ } from 'json-diff-kit';
import type { DiffResult } from 'json-diff-kit';


import App from '../components/app';

import 'json-diff-kit/dist/viewer.css';
import styles from './page.module.css'

interface ILogEntry {
  _resourceType: string;
  request: {
    url: string;
  }
}

const har = JSON.parse(fs.readFileSync('./data/localhost.har').toString());
const apiCalls = har.log.entries.filter((entry: ILogEntry) => entry._resourceType !== 'preflight' && entry.request.url.indexOf('http://localhost:9003/api') === 0);
const states = JSON.parse(fs.readFileSync('./data/log.json').toString());

const differ = new Differ({
  detectCircular: true,    // default `true`
  maxDepth: Infinity,      // default `Infinity`
  showModifications: true, // default `true`
  arrayDiffMethod: 'lcs',  // default `"normal"`, but `"lcs"` may be more useful
});

// lookup states
let previousCall = { state: {}};
for (const apiCall of apiCalls) {
  const sequence = apiCall.response.headers.find((header: { name: string, value: string }) => header.name === 'z-sequence')?.value;
  if (sequence) {
    apiCall.state = states.find((state: { sequence: string }) => state.sequence === sequence);
  }

  apiCall.diff = differ.diff(_.omit(previousCall.state, 'sequence'), _.omit(apiCall.state, 'sequence'));

  previousCall = apiCall;
}

export default function Home() {
  return (
    <main className="h-screen flex">
     <App apiCalls={apiCalls} />
    </main>
  )
}
