using Microsoft.AspNetCore.Http;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using VehicleParts.API.Models;

namespace VehicleParts.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);

                // Handle status codes that didn't throw an exception (e.g., 401, 403, 404 from routes that don't exist)
                if (context.Response.StatusCode == (int)HttpStatusCode.Unauthorized && !context.Response.HasStarted)
                {
                    await HandleStatusCodeAsync(context, "Unauthorized access", HttpStatusCode.Unauthorized);
                }
                else if (context.Response.StatusCode == (int)HttpStatusCode.Forbidden && !context.Response.HasStarted)
                {
                    await HandleStatusCodeAsync(context, "Access forbidden", HttpStatusCode.Forbidden);
                }
                else if (context.Response.StatusCode == (int)HttpStatusCode.NotFound && !context.Response.HasStarted)
                {
                    await HandleStatusCodeAsync(context, "Resource not found", HttpStatusCode.NotFound);
                }
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleStatusCodeAsync(HttpContext context, string message, HttpStatusCode code)
        {
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.ErrorResponse(message);
            var result = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(result);
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError;
            var message = "An internal server error occurred.";

            if (exception is UnauthorizedAccessException) code = HttpStatusCode.Unauthorized;
            
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            var response = ApiResponse<object>.ErrorResponse(exception.Message ?? message);
            var result = JsonSerializer.Serialize(response);

            return context.Response.WriteAsync(result);
        }
    }
}
