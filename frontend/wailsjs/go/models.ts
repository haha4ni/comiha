export namespace main {
	
	export class ComicInfo {
	    Title: string;
	    Series: string;
	    Year: number;
	    Month: number;
	    Day: number;
	    Writer: string;
	
	    static createFrom(source: any = {}) {
	        return new ComicInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Title = source["Title"];
	        this.Series = source["Series"];
	        this.Year = source["Year"];
	        this.Month = source["Month"];
	        this.Day = source["Day"];
	        this.Writer = source["Writer"];
	    }
	}
	export class ImageData {
	    FileName: string;
	    Base64Data: string;
	    Extension: string;
	
	    static createFrom(source: any = {}) {
	        return new ImageData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FileName = source["FileName"];
	        this.Base64Data = source["Base64Data"];
	        this.Extension = source["Extension"];
	    }
	}

}

export namespace utils {
	
	export class BookInfo {
	    Title: string;
	    Volume: string;
	    Author: string;
	    Tags: string[];
	    Publisher: string;
	    ReleaseDate: string;
	    PageCount: string;
	    EPUBFormat: string;
	    Description: string;
	
	    static createFrom(source: any = {}) {
	        return new BookInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Title = source["Title"];
	        this.Volume = source["Volume"];
	        this.Author = source["Author"];
	        this.Tags = source["Tags"];
	        this.Publisher = source["Publisher"];
	        this.ReleaseDate = source["ReleaseDate"];
	        this.PageCount = source["PageCount"];
	        this.EPUBFormat = source["EPUBFormat"];
	        this.Description = source["Description"];
	    }
	}
	export class FileNode {
	    name: string;
	    path: string;
	    children?: FileNode[];
	
	    static createFrom(source: any = {}) {
	        return new FileNode(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.children = this.convertValues(source["children"], FileNode);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ImageData {
	    FileName: string;
	    Thumbnail: number[];
	
	    static createFrom(source: any = {}) {
	        return new ImageData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FileName = source["FileName"];
	        this.Thumbnail = source["Thumbnail"];
	    }
	}

}

