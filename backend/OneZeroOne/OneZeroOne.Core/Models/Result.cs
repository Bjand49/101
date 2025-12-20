using System;
using System.Collections.Generic;
using System.Text;

namespace OneZeroOne.Core.Models
{
    public record Result<T>(bool IsSuccess, T? Value, string? Error)
    {
        public static Result<T> Success(T value) => new Result<T>(true, value, null);
        public static Result<T> Failure(string error) => new Result<T>(false, default, error);
    }
}
