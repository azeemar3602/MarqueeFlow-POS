-- Suppliers & payables (vendor khata / accounts payable)

CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  balance DECIMAL(10,2) DEFAULT 0,
  public_token VARCHAR(64) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant(tenant_id)
);

CREATE TABLE IF NOT EXISTS supplier_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,
  type ENUM('purchase','payment','adjustment') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  note VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant(tenant_id),
  INDEX idx_supplier(supplier_id)
);
