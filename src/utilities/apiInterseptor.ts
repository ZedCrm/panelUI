import { HttpInterceptor } from "@angular/common/http";
import { Domain } from "./Path";

export class apiInterseptor implements HttpInterceptor {
    intercept(req: import("@angular/common/http").HttpRequest<any>, next: import("@angular/common/http").HttpHandler): import("rxjs").Observable<import("@angular/common/http").HttpEvent<any>> {
        

        const myRequest = req.clone({
            url: Domain + req.url   
        });

        return next.handle(myRequest);



    }
}