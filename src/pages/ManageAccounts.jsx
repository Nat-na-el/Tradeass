import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import { Trash2, Edit, RefreshCw } from "lucide-react";

export default function ManageAccounts() {
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("accounts") || "[]");
    setAccounts(stored);
  }, []);

  const updateAccounts = (updated) => {
    setAccounts(updated);
    localStorage.setItem("accounts", JSON.stringify(updated));
  };

  const renameAccount = (account) => {
    const updated = accounts.map((a) =>
      a.id === account.id ? { ...a, name: editName || account.name } : a
    );
    updateAccounts(updated);
    setEditingId(null);
    setEditName("");
  };

  const deleteAccount = (accountId) => {
    if (!window.confirm("Delete this account? All data will be lost!")) return;

    const updated = accounts.filter((a) => a.id !== accountId);
    updateAccounts(updated);

    // Delete account data
    localStorage.removeItem(`${accountId}_trades`);
    localStorage.removeItem(`${accountId}_notes`);
    localStorage.removeItem(`${accountId}_journals`);

    if (localStorage.getItem("currentAccountId") === accountId) {
      localStorage.setItem("currentAccountId", updated[0]?.id || "");
      window.location.href = "/";
    }
  };

  const resetAccount = (accountId) => {
    if (!window.confirm("Reset all trades/notes for this account?")) return;

    localStorage.setItem(`${accountId}_trades`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_notes`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_journals`, JSON.stringify([]));

    const updated = accounts.map((a) =>
      a.id === accountId ? { ...a, totalPnL: 0 } : a
    );
    updateAccounts(updated);
  };

  if (accounts.length === 0) {
    return (
      <div
        className={`p-6 bg-white dark:bg-gray-900 ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">No Accounts</h2>
          <Button
            onClick={() => (window.location.href = "/edit-balance-pnl")}
            className="bg-blue-600"
          >
            Create First Account
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-6 bg-white dark:bg-gray-900 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Manage Accounts
        </h2>
        <Button
          onClick={() => (window.location.href = "/edit-balance-pnl")}
          className="bg-green-600"
        >
          + New Account
        </Button>
      </div>

      <div className="space-y-4">
        {accounts.map((account) => (
          <Card key={account.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editingId === account.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 p-2 border rounded dark:bg-gray-700"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => renameAccount(account)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {account.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Created:{" "}
                        {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(account.id);
                    setEditName(account.name);
                  }}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetAccount(account.id)}
                >
                  <RefreshCw size={16} />
                </Button>
                {accounts.length > 1 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteAccount(account.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
