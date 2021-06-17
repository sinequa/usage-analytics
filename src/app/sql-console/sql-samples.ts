export interface SQLSample {
    name: string,
    icon?: string,
    code?: string,
    children?: SQLSample[]
}

export const samples: SQLSample = {
    name: "Samples",
    icon: "fas fa-fw fa-lightbulb",
    children: [
        {
            name: "SELECT",
            code: "SELECT * FROM index WHERE text contains 'Hello World' AND company='microsoft' LIMIT 20;"
        },    
        {
            name: "UPDATE",
            code: "UPDATE index SET sourcestr1='Foo', sourcedouble1='42' WHERE text contains 'Hello World' AND company='microsoft';"
        },
        {
            name: "DELETE",
            code: "DELETE FROM index WHERE text contains 'Hello World' AND company='microsoft';"
        },
        {
            name: "INSERT",
            code: "INSERT INTO index (column1,column2) VALUES('value1','value2');"
        },
        {
            name: "Distribution",
            code: "SELECT distribution('person,count=10,basicforms=true,labels=true,order2=labelasc,freq=true,limit=1000,order=freqdesc,post-group-by=true,merge-groups=true') as dist_person\n\tFROM index LIMIT 1;"
        },
        {
            name: "Correlation",
            code: "SELECT correlation('person,count=10,basicforms=true,labels=true,order2=labelasc,scores=true,freq=true,limit=1000,order=scoredesc,post-group-by=true,merge-groups=true') as correl_person\n\tFROM index LIMIT 1;"
        },
        {
            name: "Cross-Distribution",
            code: "SELECT distribution('person/company,count=10,basicforms=true,labels=true,order2=labelasc,order=freqdesc,post-group-by=true,merge-groups=true,keyseparator=/') as count_person_company\n\tFROM index WHERE text contains 'spacex' LIMIT 1;"
        },
        {
            name: "Relevant extracts",
            code: "SELECT highlight(Text,'chunk=sentence/window,count=10,context.window=3,offsets=true,separator=;,startmarker=\"{b}\",endmarker=\"{nb}\",remap=true,dedup=1') as extracts\n\tFROM index WHERE text contains 'Hello World' LIMIT 10;"
        },
        {
            name: "Match locations",
            code: "SELECT matchlocations('remap=true,perterm=true,groupexpr=true'),\n\tmatchlocations('remap=true,perpartname=true') as matchlocationsperpartname\n\tFROM index WHERE text contains 'Hello World' LIMIT 10;"
        },
        {
            name: "Relevance transforms",
            code: "SELECT * FROM index WHERE text contains 'Hello World' and relevancetransforms='<RelevanceTransforms><PartNameBoost fraction=\"30\"><PartNames mode=\"and\"><PartName>title</PartName></PartNames><Action op=\"add\" field=\"sourcedouble1\"></Action></PartNameBoost></RelevanceTransforms>' LIMIT 10;"
        },
        {
            name: "Access-list",
            code: "SELECT * FROM index WHERE (CACHE (CHECKACLS('accesslists=\"accesslist1,accesslist2\",deniedlists=\"deniedlist1\"') FOR ('sinequa|admin'))) LIMIT 10;"
        }
    ]
};