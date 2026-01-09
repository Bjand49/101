using System.Collections.Concurrent;

namespace OneZeroOne.Web.SignalR
{
    public class ConnectionManager
    {
        private static readonly ConcurrentDictionary<string, HashSet<string>> _connections = new();
        public void AddToGroup(string groupName, string connectionId)
        {
            _connections.AddOrUpdate(
                groupName,
                _ => new HashSet<string> { connectionId },
                (_, set) =>
                {
                    lock (set) { set.Add(connectionId); }
                    return set;
                });
        }

        public void RemoveFromGroup(string groupName, string connectionId)
        {
            if (_connections.TryGetValue(groupName, out var set))
            {
                lock (set) { set.Remove(connectionId); }
            }
        }

        public void RemoveConnection(string connectionId)
        {
            foreach (var kvp in _connections)
            {
                lock (kvp.Value) { kvp.Value.Remove(connectionId); }
            }
        }
    }
}
