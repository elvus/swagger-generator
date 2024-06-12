import React, { useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSONToSwaggerConverter from '../utils/swaggerGen';

interface PreviewProps {
    swaggerType: string;
    json: any;
}

const Preview: React.FC<PreviewProps> = ({ swaggerType, json }) => {
    const [value, setValue] = React.useState('');

    const converter = new JSONToSwaggerConverter(swaggerType, json, true);
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