class JSONToSwaggerConverter {
    swagger = ``;
    json: any = {};
    yaml = false;
    url = new URL(`https://host`);

    constructor(swagger: string, json: any, yaml: boolean) {
        this.swagger = swagger;
        this.json = json;
        this.yaml = yaml;
        this.url = json ? new URL(json.url) : this.url;
    }

    #getObjectType(obj: any) {
        if(typeof obj === `number`){
            return `integer`;
        }else if(typeof obj === `object`){
            if(Array.isArray(obj)){
                return `array`;
            }
            return `object`;
        }else if(typeof obj === `string`){
            return `string`;
        }else if(typeof obj === `boolean`){
            return `boolean`;
        }
    }
    
    #getSchenmaProperties(obj: any, spaces: number) {
        let schema = ``;
        
        if(Array.isArray(obj)){
            schema += `${" ".repeat(spaces - 2)}items:\n`;
            schema += `${" ".repeat(spaces)}type: ${this.#getObjectType(obj[0])}\n`;
            schema += `${" ".repeat(spaces)}properties:\n`;
            if(this.#getObjectType(obj[0]) === `object`){
                obj = obj[0];
                spaces += 2;
            }
        }else if(this.#getObjectType(obj) === `object`){
            schema += `${" ".repeat(spaces - 2)}properties:\n`;
        }

        for (let key in obj) {
            schema += `${" ".repeat(spaces)}${key}:\n`;
            schema += `${" ".repeat(spaces+2)}type: ${this.#getObjectType(obj[key])}\n`;
            if(this.#getObjectType(obj[key]) === `array`){
                schema += `${" ".repeat(spaces+2)}items:\n`;
                schema += `${" ".repeat(spaces+4)}type: ${this.#getObjectType(obj[key][0])}\n`;
                if(this.#getObjectType(obj[key][0]) === `object`){
                    schema += this.#getSchenmaProperties(obj[key][0], spaces+6);
                }
            }else if(this.#getObjectType(obj[key]) === `object`){
                schema += this.#getSchenmaProperties(obj[key], spaces+4);
            }
        }
        return schema;
    }

    convert() {
        let swaggerSchema = ``;
        if (this.yaml) {
            if (this.swagger === `3.0`) {
                swaggerSchema += `openapi: "3.0.0"\n`;
                swaggerSchema += `info:\n`;
                swaggerSchema += `  title: "API"\n`;
                swaggerSchema += `  description: "API"\n`;
                swaggerSchema += `  version: "1.0.0"\n`;
                swaggerSchema += `servers:\n`;
                swaggerSchema += `  - url: "${this?.url.origin || "https://host"}"\n`;
                swaggerSchema += `    description: "Local server"\n`;

            } else {
                swaggerSchema += `swagger: "2.0"\n`;
                swaggerSchema += `info:\n`;
                swaggerSchema += `  title: "API"\n`;
                swaggerSchema += `  description: "API"\n`;
                swaggerSchema += `  version: "1.0.0"\n`;
                swaggerSchema += `host: "${this.url.host || ""}"\n`;
                swaggerSchema += `basePath: "/"\n`;
                swaggerSchema += `schemes:\n`;
                swaggerSchema += `  - "${this.url.protocol.replace(":", "") || ""}"\n`;
                swaggerSchema += `consumes:\n`;
                swaggerSchema += `  - "application/json"\n`;
                swaggerSchema += `produces:\n`;
                swaggerSchema += `  - "application/json"\n`;
            }
            swaggerSchema += `paths:\n`;
            swaggerSchema += `  ${this.url.pathname}:\n`;
            swaggerSchema += `    ${this.json?.method}:\n`;
            swaggerSchema += `      description: ""\n`;
            if (JSON.stringify(this.json?.headers) !== `{}` && this.json?.headers !== undefined) {
                swaggerSchema += `      parameters:\n`;
                for (let key in this.json?.headers) {
                    swaggerSchema += `        - name: "${key}"\n`;
                    swaggerSchema += `          in: "header"\n`;
                    if (this.swagger === `3.0`) {
                        swaggerSchema += `          schema:\n`;
                        swaggerSchema += `            type: "string"\n`;
                    } else {
                        swaggerSchema += `          type: "string"\n`;
                    }
                }
            }
            if (JSON.stringify(this.json?.query) !== `{}` && this.json?.query !== undefined) {
                for (let key in this.json?.query) {
                    swaggerSchema += `        - name: "${key}"\n`;
                    swaggerSchema += `          in: "query"\n`;
                    if (this.swagger === `3.0`) {
                        swaggerSchema += `          schema:\n`;
                        swaggerSchema += `            type: "string"\n`;
                    } else {
                        swaggerSchema += `          type: "string"\n`;
                    }
                }
            }

            if (JSON.stringify(this.json?.data) !== `{}` && this.json?.data !== undefined) {
                if (this.swagger === `3.0`) {
                    swaggerSchema += `      requestBody:\n`;
                    swaggerSchema += `        content:\n`;
                    swaggerSchema += `          application/json:\n`;
                    swaggerSchema += `            schema:\n`;
                    swaggerSchema += `              type: "${this.#getObjectType(this.json?.data)}"\n`;
                    swaggerSchema += this.#getSchenmaProperties(this.json?.data, 16);
                } else {
                    swaggerSchema += `        - name: "body"\n`;
                    swaggerSchema += `          in: "body"\n`;
                    swaggerSchema += `          schema:\n`;
                    swaggerSchema += `            type: "${this.#getObjectType(this.json?.data)}"\n`;
                    swaggerSchema += this.#getSchenmaProperties(this.json?.data, 14);
                }
            }
            swaggerSchema += `      responses:\n`;
            swaggerSchema += `        200:\n`;
            swaggerSchema += `          description: "OK"\n`;
            if (this.json?.response) {
                if (this.swagger === `3.0`) {
                    swaggerSchema += `          content:\n`;
                    swaggerSchema += `            application/json:\n`;
                    swaggerSchema += `              schema:\n`;
                    swaggerSchema += `                $ref: "#/components/schemas/Response"\n`;
                    swaggerSchema += `components:\n`;
                    swaggerSchema += `  schemas:\n`;
                    swaggerSchema += `    Response:\n`;
                    swaggerSchema += `      type: "${this.#getObjectType(this.json?.response)}"\n`;
                    swaggerSchema += this.#getSchenmaProperties(this.json?.response, 8);
                } else {
                    swaggerSchema += `          schema:\n`;
                    swaggerSchema += `            $ref: "#/definitions/Response"\n`;
                    swaggerSchema += `definitions:\n`;
                    swaggerSchema += `  Response:\n`;
                    swaggerSchema += `    type: "${this.#getObjectType(this.json?.response)}"\n`;
                    swaggerSchema += this.#getSchenmaProperties(this.json?.response, 6);
                }
            }
        }
        return swaggerSchema;
    }
}

export default JSONToSwaggerConverter;