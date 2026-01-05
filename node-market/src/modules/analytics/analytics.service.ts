import { prisma } from "../../config/prisma";
import { OrderStatus } from "../../generated/prisma/enums";

export const AnalyticsService = {
  // Get overview statistics
  async getOverviewStats() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      totalCustomers,
      lastMonthCustomers,
      totalProducts,
    ] = await Promise.all([
      // Total revenue (all completed orders)
      prisma.order.aggregate({
        where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] } },
        _sum: { total: true },
      }),
      // Last month revenue
      prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] },
          createdAt: { gte: lastMonth },
        },
        _sum: { total: true },
      }),
      // Total orders
      prisma.order.count(),
      // Last month orders
      prisma.order.count({ where: { createdAt: { gte: lastMonth } } }),
      // Total customers
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      // Last month customers
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: lastMonth } },
      }),
      // Total products
      prisma.product.count({ where: { isActive: true } }),
    ]);

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue._sum.total
      ? ((Number(lastMonthRevenue._sum.total) / (Number(totalRevenue._sum.total) || 1)) * 100).toFixed(1)
      : "0.0";
    const ordersChange = lastMonthOrders
      ? ((lastMonthOrders / (totalOrders || 1)) * 100).toFixed(1)
      : "0.0";
    const customersChange = lastMonthCustomers
      ? ((lastMonthCustomers / (totalCustomers || 1)) * 100).toFixed(1)
      : "0.0";

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      revenueChange: `+${revenueChange}%`,
      totalOrders,
      ordersChange: `+${ordersChange}%`,
      totalCustomers,
      customersChange: `+${customersChange}%`,
      totalProducts,
      productsChange: "0%",
    };
  },

  // Get revenue trend data (last 7 months)
  async getRevenueTrend() {
    const now = new Date();
    const months = [];

    for (let i = 6; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [revenue, orders, customers] = await Promise.all([
        prisma.order.aggregate({
          where: {
            status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] },
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        }),
        prisma.user.count({
          where: {
            role: "CUSTOMER",
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
      ]);

      months.push({
        month: startDate.toLocaleString("en-US", { month: "short" }),
        revenue: Number(revenue._sum.total) || 0,
        orders,
        customers,
      });
    }

    return months;
  },

  // Get sales by category
  async getCategoryDistribution() {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { isActive: true },
          include: {
            orderItems: {
              where: {
                order: {
                  status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] },
                },
              },
            },
          },
        },
      },
    });

    const categoryData = categories.map((category) => {
      const totalValue = category.products.reduce((sum, product) => {
        const productRevenue = product.orderItems.reduce(
          (itemSum, item) => itemSum + item.quantity * Number(item.price),
          0
        );
        return sum + productRevenue;
      }, 0);

      return {
        name: category.name,
        value: totalValue,
      };
    });

    // Calculate percentages
    const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.value, 0);
    return categoryData
      .map((cat) => ({
        ...cat,
        percentage: totalRevenue > 0 ? Math.round((cat.value / totalRevenue) * 100) : 0,
      }))
      .filter((cat) => cat.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  },

  // Get daily orders for the last 7 days
  async getDailyOrders() {
    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
        prisma.order.count({
          where: { createdAt: { gte: date, lt: nextDate } },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: OrderStatus.PENDING,
          },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] },
          },
        }),
      ]);

      days.push({
        day: date.toLocaleString("en-US", { weekday: "short" }),
        orders: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      });
    }

    return days;
  },

  // Get top performing products
  async getTopProducts() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        orderItems: {
          where: {
            order: {
              status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] },
            },
          },
        },
      },
    });

    const productStats = products.map((product) => {
      const sales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = product.orderItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.price),
        0
      );

      return {
        name: product.name,
        sales,
        revenue,
        growth: Math.floor(Math.random() * 30) - 10, // Placeholder - would need historical data
      };
    });

    return productStats
      .filter((p) => p.sales > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products
  },

  // Get all analytics data in one call
  async getAllAnalytics() {
    const [stats, revenueTrend, categoryDistribution, dailyOrders, topProducts] =
      await Promise.all([
        this.getOverviewStats(),
        this.getRevenueTrend(),
        this.getCategoryDistribution(),
        this.getDailyOrders(),
        this.getTopProducts(),
      ]);

    return {
      stats,
      revenueTrend,
      categoryDistribution,
      dailyOrders,
      topProducts,
    };
  },
};
