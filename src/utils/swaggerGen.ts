interface urlAttributes {
    protocol: string;
    host: string;
    basePath: string;
}

class JSONToSwaggerConverter {
    method: string = 'get';
    headers: {};
    query: {};
    body: any;
    yaml: boolean = false;
    swagger: string;
    urlAttributes: urlAttributes;
    response: any;

    constructor(swagger: string, urlAttributes: urlAttributes, method: string = 'get', headers: {}, query: {}, body: any, response: any, yaml: boolean = false) {
        this.method = method;
        this.headers = headers;
        this.query = query;
        this.body = body;
        this.yaml = yaml;
        this.swagger = swagger;
        this.urlAttributes = urlAttributes;
        this.response = response;
    }

    convert() {
        let swaggerSchema = '';
        if (this.yaml) {
            if(this.swagger === '3.0') {
                swaggerSchema += 'openapi: "3.0.0"\n';
                swaggerSchema += 'info:\n';
                swaggerSchema += '  title: "API"\n';
                swaggerSchema += '  description: "API"\n';
                swaggerSchema += '  version: "1.0.0"\n';
                swaggerSchema += 'servers:\n';
                swaggerSchema += `  - url: "${this.urlAttributes.protocol || "https:"}//${this.urlAttributes.host || "host"}"\n`;
                swaggerSchema += '    description: "Local server"\n';

            }else{
                swaggerSchema += 'swagger: "2.0"\n';
                swaggerSchema += 'info:\n';
                swaggerSchema += '  title: "API"\n';
                swaggerSchema += '  description: "API"\n';
                swaggerSchema += '  version: "1.0.0"\n';
                swaggerSchema += `host: "${this.urlAttributes.host || ""}"\n`;
                swaggerSchema += `basePath: "${this.urlAttributes.basePath || ""}"\n`;
                swaggerSchema += 'schemes:\n';
                swaggerSchema += `  - "${this.urlAttributes.protocol ? this.urlAttributes.protocol.replace(":", "") : ""}"\n`;
                swaggerSchema += 'consumes:\n';
                swaggerSchema += '  - "application/json"\n';
                swaggerSchema += 'produces:\n';
                swaggerSchema += '  - "application/json"\n';
            }
            swaggerSchema += 'paths:\n';
            swaggerSchema += `  ${this.urlAttributes.basePath}:\n`;
            swaggerSchema += `    ${this.method}:\n`;
            swaggerSchema += '      description: ""\n';
            swaggerSchema += '      operationId: "get"\n';
            if(JSON.stringify(this.headers) !== '{}' || JSON.stringify(this.query) !== '{}' || JSON.stringify(this.body) !== '{}'){
                swaggerSchema += '      parameters:\n';
                for (let key in this.headers) {
                    swaggerSchema += `        - name: "${key}"\n`;
                    swaggerSchema += '          in: "header"\n';
                    if(this.swagger === '3.0') {
                        swaggerSchema += '          schema:\n';
                        swaggerSchema += '            type: "string"\n';
                    }else{
                        swaggerSchema += '          type: "string"\n';
                    }
                }
                for (let key in this.query) {
                    swaggerSchema += `        - name: "${key}"\n`;
                    swaggerSchema += '          in: "query"\n';
                    if(this.swagger === '3.0') {
                        swaggerSchema += '          schema:\n';
                        swaggerSchema += '            type: "string"\n';
                    }else{
                        swaggerSchema += '          type: "string"\n';
                    }
                }
                if(JSON.stringify(this.body) !== '{}'){
                    if(this.swagger === '3.0') {
                        swaggerSchema += `      requestBody:\n`;
                        swaggerSchema += '        content:\n';
                        swaggerSchema += '          application/json:\n';
                        swaggerSchema += '            schema:\n';
                        swaggerSchema += '              type: "object"\n';
                        swaggerSchema += '              properties:\n';
                        for (let key in this.body) {
                            swaggerSchema += `                  ${key}:\n`;
                            swaggerSchema += `                    type: ${typeof this.body[key]}\n`;
                        }
                    }else{
                        swaggerSchema += `        - name: "body"\n`;
                        swaggerSchema += '          in: "body"\n';
                        swaggerSchema += '          schema:\n';
                        swaggerSchema += '            type: "object"\n';
                        swaggerSchema += '            properties:\n';
                        for (let key in this.body) {
                            swaggerSchema += `              ${key}:\n`;
                            swaggerSchema += `                type: ${typeof this.body[key]}\n`;
                        }
                    }
                }
            }
            swaggerSchema += '      responses:\n';
            swaggerSchema += '        200:\n';
            swaggerSchema += '          description: "OK"\n';
            if(this.response) {
                swaggerSchema += '          content:\n';
                swaggerSchema += '            application/json:\n';
                swaggerSchema += '              schema:\n';
                swaggerSchema += '                $ref: "#/components/schemas/Response"\n';
            }
            if(this.swagger === '3.0') {
                swaggerSchema += `components:\n`;
                swaggerSchema += `  schemas:\n`;
                if(this.response){
                    swaggerSchema += `    Response:\n`;
                    swaggerSchema += `      type: "${typeof this.response}"\n`;
                    swaggerSchema += `      properties:\n`;
                    for (let key in this.response) {
                        swaggerSchema += `        ${key}:\n`;
                        swaggerSchema += `          type: ${typeof this.response[key]}\n`;
                    }
                }
                swaggerSchema += `    Error:\n`;
                swaggerSchema += `      type: "object"\n`;
                swaggerSchema += `      properties:\n`;
                swaggerSchema += `        code:\n`;
                swaggerSchema += `          type: "integer"\n`;
                swaggerSchema += `        message:\n`;
                swaggerSchema += `          type: "string"\n`;
            }else{
                swaggerSchema += 'definitions:\n';
                swaggerSchema += '  Error:\n';
                swaggerSchema += '    type: "object"\n';
                swaggerSchema += '    properties:\n';
                swaggerSchema += '      code:\n';
                swaggerSchema += '        type: "integer"\n';
                swaggerSchema += '      message:\n';
                swaggerSchema += '        type: "string"\n';
            }
        }
        return swaggerSchema;
    }
}

export default JSONToSwaggerConverter;