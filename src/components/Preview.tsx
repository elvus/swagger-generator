import React, { useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSONToSwaggerConverter from '../utils/swaggerGen';

interface PreviewProps {
    swaggerType: string;
    method: string;
    json: any;
}

const Preview: React.FC<PreviewProps> = ({ swaggerType, method, json }) => {
    const [value, setValue] = React.useState('');
    const swaggerProps = new Map().set('headers', new Map()).set('query', new Map()).set('body', new Map());
    json.headers.forEach((header: any) => {
        swaggerProps.get("headers").set(header.key_param, header.value_param);
    });

    json.query.forEach((query: any) => {
        swaggerProps.get("query").set(query.key_param, query.value_param);
    });

    json.body.forEach((body: any) => {
        swaggerProps.get("body").set(body.key_param, body.value_param);
    });

    const converter = new JSONToSwaggerConverter(swaggerType, json.urlAttr, method, Object.fromEntries(swaggerProps.get("headers")), Object.fromEntries(swaggerProps.get("query")), Object.fromEntries(swaggerProps.get("body")), json.response, true);
    const swaggerSchema = converter.convert();
    useEffect(() => {
        setValue(swaggerSchema);
    }, [swaggerSchema]);
    return(
        <>
         <SyntaxHighlighter language="yaml" style={atomOneDark}>{ value } </SyntaxHighlighter>
        </>);
}

export default Preview;