using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

//using CoreHubServer.ActiveDirectoryInterface;
//using System.Web;
//using System.Configuration;
//using System.Web.Mvc;

using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

namespace CoreHubServer.Controllers
{
    public class HomeController : Controller
    {
        private IConfiguration config { get; set; }

        public HomeController(IConfiguration configuration)
        {
            this.config = configuration;
        }

        //public ActionResult Auth(string id)
        //{
        //    return this.Index(id);
        //}

        public ActionResult Index(/*string id*/)
        {
            var cookieOpts = new CookieOptions() { Expires = DateTime.Now.AddYears(1) };
            if (!string.IsNullOrEmpty(config["AppSettings:HubClientDomain"]))
                cookieOpts.Domain = config["AppSettings:HubClientDomain"];

            //Response.Cookies.Append("EmployeeID", adUser.EmployeeID.ToString(), cookieOpts);
            Response.Cookies.Append("OsEnvironmentUrl", config["AppSettings:OsEnvironmentUrl"], cookieOpts);
            Response.Cookies.Append("QueryString", Request.QueryString.Value, cookieOpts);

            return new RedirectResult(config["AppSettings:HubClientWebroot"] + Request.QueryString.Value);
        }


    }
}
