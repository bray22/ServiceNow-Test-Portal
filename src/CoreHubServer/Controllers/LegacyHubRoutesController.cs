using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;


namespace CoreHubServer.Controllers
{
    public class LegacyHubRoutesController : Controller
    {
        private IConfiguration config { get; set; }

        public LegacyHubRoutesController(IConfiguration configuration)
        {
            this.config = configuration;
        }

        [Route("TheHub/{*.aspx}")]
        [Route("/LandingPage.aspx")]
        [Route("/Desktop.aspx")]
        public IActionResult TheHub(string id)
        {
            return Redirect("/" + Request.QueryString.Value);
        }

        [Route("TheHubAPI/{*endpoint}")]
        public IActionResult API(string endpoint)
        {
            return Redirect(config["AppSettings:OsEnvironmentUrl"] + "/TheHubAPI/" + endpoint + Request.QueryString.Value);
        }

        [Route("ATE_Report/{*endpoint}")]
        [Route("TMSearchPortal/{*endpoint}")]
        public IActionResult OsApps(string endpoint)
        {
            return Redirect(config["AppSettings:OsEnvironmentUrl"] + Request.Path.Value);
        }

    }
}
