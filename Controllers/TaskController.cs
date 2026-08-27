using Microsoft.AspNetCore.Mvc;
using Task_Management.DbContexts;
using Task_Management.Models;
using Task_Management.Dtos.Task;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Task_Management.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskManagementContext _context;

        public TasksController(TaskManagementContext context)
        {
            _context = context;
        }

        [HttpGet("GetByCriteria")]
        public IActionResult GetByCriteria([FromQuery] TaskFilterDto dto)
        {
            try
            {
                var userId = long.Parse(User.FindFirst("UserId")!.Value);

                var query = _context.Tasks
                    .Where(x => x.UserId == userId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(dto.Title))
                {
                    query = query.Where(x => x.Title.Contains(dto.Title));
                }

                if (dto.StatusId.HasValue)
                {
                    query = query.Where(x => x.StatusId == dto.StatusId.Value);
                }

                var result = query.Select(x => new TaskResponseDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    Description = x.Description,
                    FromDate = x.FromDate,
                    ToDate = x.ToDate,
                    StatusId = x.StatusId,
                    StatusName = _context.Lookups.FirstOrDefault(l => l.Id == x.StatusId).Name
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetById/{id}")]
        public IActionResult GetById(long id)
        {
            try
            {
                var userId = long.Parse(User.FindFirst("UserId")!.Value);
                var task = _context.Tasks.FirstOrDefault(x => x.Id == id);

                if (task == null)
                {
                    return NotFound("Task not found");
                }

                if (task.UserId != userId)
                {
                    return BadRequest("This task belongs to another user");
                }

                var response = new TaskResponseDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    FromDate = task.FromDate,
                    ToDate = task.ToDate,
                    StatusId = task.StatusId,
                    StatusName = _context.Lookups.FirstOrDefault(l => l.Id == task.StatusId).Name
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("Add")]
        public IActionResult Add(AddTaskDto dto)
        {
            try
            {
                if (dto.FromDate > dto.ToDate)
                {
                    return BadRequest("FromDate cannot be greater than ToDate");
                }

                var userId = long.Parse( User.FindFirst("UserId")!.Value);

                TaskItem task = new TaskItem
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    FromDate = dto.FromDate,
                    ToDate = dto.ToDate,
                    StatusId = dto.StatusId,
                    UserId = userId
                };

                _context.Tasks.Add(task);
                _context.SaveChanges();

                var response = new TaskResponseDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    FromDate = task.FromDate,
                    ToDate = task.ToDate,
                    StatusId = task.StatusId,
                    StatusName = _context.Lookups.FirstOrDefault(l => l.Id == task.StatusId).Name
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("Update")]
        public IActionResult Update(UpdateTaskDto dto)
        {
            try
            {
                var userId = long.Parse(User.FindFirst("UserId")!.Value);

                var task = _context.Tasks.FirstOrDefault(x => x.Id == dto.Id);

                if (task == null)
                {
                    return NotFound("Task not found");
                }

                if (task.UserId != userId)
                {
                    return BadRequest("This task belongs to another user");
                }

                if (dto.FromDate > dto.ToDate)
                {
                    return BadRequest("FromDate cannot be greater than ToDate");
                }

                task.Title = dto.Title;
                task.Description = dto.Description;
                task.FromDate = dto.FromDate;
                task.ToDate = dto.ToDate;
                task.StatusId = dto.StatusId;

                _context.SaveChanges();

                var response = new TaskResponseDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    FromDate = task.FromDate,
                    ToDate = task.ToDate,
                    StatusId = task.StatusId,
                    StatusName = _context.Lookups.FirstOrDefault(l => l.Id == task.StatusId).Name
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("Delete/{id}")]
        public IActionResult Delete(long id)
        {
            try
            {
                var userId = long.Parse(User.FindFirst("UserId")!.Value);

                var task = _context.Tasks.FirstOrDefault(x => x.Id == id);

                if (task == null)
                {
                    return NotFound("Task not found");
                }

                if (task.UserId != userId)
                {
                    return BadRequest("This task belongs to another user");
                }

                _context.Tasks.Remove(task);
                _context.SaveChanges();

                return Ok("Task deleted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        












    }
}