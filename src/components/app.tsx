'use client';
import Diff from './diff';

import {useState} from 'react';

interface Props {
  apiCalls: Array<{}>
}
export default function App({ apiCalls }: Props) {
  const [ requestBody, setRequestBody ] = useState('');
  const [ diff, setDiff ] = useState(null);
  const [ selectedApiCall, setSelectedApiCall] = useState(null);

  const focusApiCall = (apiCall) => {
    let body;
    if (apiCall.request?.postData?.text) {
      try {
        body = JSON.stringify(JSON.parse(apiCall.request.postData.text), null, '\t');
      } catch (err) {
        body = apiCall.request.postData.text;
      }
      setRequestBody(body);
    } else {
      setRequestBody('');
    }
    if (apiCall.diff) {
      setDiff(apiCall.diff);
    } else {
      setDiff(null);
    }
    setSelectedApiCall(apiCall);
  }

  return (
    <>
      <div className="bg-gray-600 w-1/4 overflow-hidden">
        <div className="overflow-y-scroll h-full">
          {apiCalls.map((apiCall) => (
            <a href="#" onClick={() => focusApiCall(apiCall)} className={`block p-2  border border-gray-200 shadow hover:bg-gray-100 ${apiCall === selectedApiCall ? 'bg-gray-600': 'dark:bg-gray-800'} dark:border-gray-700 dark:hover:bg-gray-700`}>
              <h5 className="mb-2 text-sm  text-gray-400"><strong>{apiCall.request.method}</strong> {apiCall.request.url}</h5>
            </a>
          ))}
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-scroll">
          <div className="p-8 space-y-4">
            <h3 className="text-lg font-bold">Request Body</h3>
            <pre className="max-h-80 overflow-y-auto p-2 border-gray-200 border text-sm">
              {requestBody}
            </pre>
            <h3 className="text-lg font-bold">State Diff</h3>
            { diff && (
              <Diff diff={diff} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
