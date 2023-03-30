import { Inter } from 'next/font/google'
import fs from 'fs';
import _ from 'lodash';
import { Viewer, Differ } from 'json-diff-kit';
import type { DiffResult } from 'json-diff-kit';
import Diff from '../components/diff';

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

// lookup states
for (const apiCall of apiCalls) {
  const sequence = apiCall.response.headers.find((header: { name: string, value: string }) => header.name === 'z-sequence')?.value;
  if (sequence) {
    apiCall.state = states.find((state: { sequence: string }) => state.sequence === sequence);
  }
}

const differ = new Differ({
  detectCircular: true,    // default `true`
  maxDepth: Infinity,      // default `Infinity`
  showModifications: true, // default `true`
  arrayDiffMethod: 'lcs',  // default `"normal"`, but `"lcs"` may be more useful
});

export default function Home() {
  return (
    <main>
      {apiCalls.map((apiCall, index) => {
        let oldState;
        if (index > 0 && apiCalls[index - 1].state) {
          oldState = apiCalls[index-1].state;
        }

        let diff;
        if (oldState && apiCall.state) {
         diff = differ.diff(_.omit(oldState, 'sequence'), _.omit(apiCall.state, 'sequence'));
        }

        return (
          <div className={styles.request}>
            <div>
              Method: {apiCall.request.method}<br/>
              URL: {apiCall.request.url}
              {apiCall.request.postData && (
                <pre className="req">
                {apiCall.request.postData.text}
              </pre>
              )}<br/>
              {diff && (
                <Diff
                  diff={diff}
                />
              ) }
            </div>
          </div>
        );
      })}
    </main>
  )
}
