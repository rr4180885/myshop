import { type User, type InsertUser, type Product, type InsertProduct, type Invoice, type InsertInvoice } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Invoices
  getInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  
  // Sessions
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<number, Product>;
  private invoices: Map<number, Invoice>;
  private productIdCounter: number = 1;
  private invoiceIdCounter: number = 1;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.invoices = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.seedProducts();
  }

  private seedProducts() {
    const defaultProducts = [
      { name: "Brake Pad Set", brand: "Maruti Swift", code: "BP-MS-001", hsnCode: "8708", stock: 25, purchasePrice: "450", sellingPrice: "650", gstRate: 28 },
      { name: "Air Filter", brand: "Hyundai i20", code: "AF-HI-002", hsnCode: "8708", stock: 15, purchasePrice: "250", sellingPrice: "400", gstRate: 28 },
      { name: "Oil Filter", brand: "Tata Nexon", code: "OF-TN-003", hsnCode: "8708", stock: 30, purchasePrice: "180", sellingPrice: "300", gstRate: 28 },
      { name: "Headlight Bulb", brand: "Maruti Alto", code: "HB-MA-004", hsnCode: "8708", stock: 50, purchasePrice: "80", sellingPrice: "150", gstRate: 18 },
      { name: "Wiper Blade", brand: "Honda City", code: "WB-HC-005", hsnCode: "8708", stock: 20, purchasePrice: "200", sellingPrice: "350", gstRate: 28 },
    ];

    defaultProducts.forEach(p => {
      const product: Product = {
        id: this.productIdCounter++,
        name: p.name,
        brand: p.brand,
        code: p.code,
        hsnCode: p.hsnCode,
        stock: p.stock,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        gstRate: p.gstRate,
      };
      this.products.set(product.id, product);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id } as Product;
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const newInvoice: Invoice = { ...invoice, id } as Invoice;
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }
}

export const storage = new MemStorage();
