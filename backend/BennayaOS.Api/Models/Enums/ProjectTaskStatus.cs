namespace BennayaOS.Api.Models.Enums;

/// <summary>
/// Named ProjectTaskStatus, not TaskStatus, because System.Threading.Tasks
/// already defines a TaskStatus enum. Every async file imports that namespace,
/// so the short name would collide constantly.
/// </summary>
public enum ProjectTaskStatus
{
    Todo = 0,
    InProgress = 1,
    Completed = 2,
}
