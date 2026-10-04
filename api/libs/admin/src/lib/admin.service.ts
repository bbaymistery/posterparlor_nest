import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  Poster,
  PosterDocument,
  User,
  UserDocument,
} from '@new-poster-parlor-api/models';
import {
  BadRequestException,
  NotFoundException,
} from '@new-poster-parlor-api/utils';

export interface GetOrdersParams {
  page: number;
  limit: number;
  status?: OrderStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetCustomersParams {
  page: number;
  limit: number;
  search?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Poster.name) private posterModel: Model<PosterDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month stats
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      ordersByStatus,
      currentMonthRevenue,
      currentMonthOrders,
      currentMonthCustomers,
      lastMonthRevenue,
      lastMonthOrders,
      lastMonthCustomers,
      totalRevenueResult,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.userModel.countDocuments(),
      this.posterModel.countDocuments({ isAvailable: true }),
      this.orderModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.userModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            isPaid: true,
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      this.orderModel.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      this.userModel.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      this.orderModel.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    // Map status counts
    const statusMap: Record<string, number> = {};
    ordersByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    // Calculate percentage changes
    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const prevRevenue = lastMonthRevenue[0]?.total || 1; // Avoid division by 0
    const revenueChange = ((currentRevenue - prevRevenue) / prevRevenue) * 100;

    const ordersChange =
      ((currentMonthOrders - lastMonthOrders) / (lastMonthOrders || 1)) * 100;
    const customersChange =
      ((currentMonthCustomers - lastMonthCustomers) /
        (lastMonthCustomers || 1)) *
      100;

    return {
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders: statusMap[OrderStatus.PENDING] || 0,
      processingOrders: statusMap[OrderStatus.PROCESSING] || 0,
      shippedOrders: statusMap[OrderStatus.SHIPPED] || 0,
      deliveredOrders: statusMap[OrderStatus.DELIVERED] || 0,
      cancelledOrders: statusMap[OrderStatus.CANCELLED] || 0,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
      customersChange: Math.round(customersChange * 10) / 10,
    };
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10): Promise<OrderDocument[]> {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'items.posterId',
        model: 'Poster',
        select: 'title images',
      })
      .lean()
      .exec() as any;
  }

  /**
   * Get all orders with pagination and filters
   */
  async getAllOrders(params: GetOrdersParams) {
    const { page, limit, status, search, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const cleanSearch = search.replace(/^#/, '').trim();
      const orConditions: Record<string, unknown>[] = [
        { 'customer.name': { $regex: cleanSearch, $options: 'i' } },
        { 'customer.email': { $regex: cleanSearch, $options: 'i' } },
        { 'customer.phone': { $regex: cleanSearch, $options: 'i' } },
        { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: cleanSearch, options: 'i' } } },
      ];

      if (this.isValidObjectId(cleanSearch)) {
        orConditions.push({ _id: cleanSearch });
      }

      query.$or = orConditions;
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'items.posterId',
          model: 'Poster',
          select: 'title images',
        })
        .lean()
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get order by ID (admin - no user restriction)
   */
  async getOrderById(orderId: string): Promise<OrderDocument> {
    if (!this.isValidObjectId(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderModel
      .findById(orderId)
      .populate({
        path: 'items.posterId',
        model: 'Poster',
        select: 'title images dimensions material category',
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<OrderDocument> {
    if (!this.isValidObjectId(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const updateData: Record<string, unknown> = { status };

    if (trackingNumber && status === OrderStatus.SHIPPED) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await this.orderModel
      .findByIdAndUpdate(orderId, updateData, { new: true })
      .populate({
        path: 'items.posterId',
        model: 'Poster',
        select: 'title images',
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<OrderDocument> {
    if (!this.isValidObjectId(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Can only cancel pending or processing orders
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Cannot cancel order that is already shipped or delivered'
      );
    }

    // Restore stock for cancelled orders
    for (const item of order.items) {
      await this.posterModel.findByIdAndUpdate(item.posterId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = OrderStatus.CANCELLED;
    if (reason) {
      order.notes = `Cancelled: ${reason}`;
    }

    return order.save();
  }

  /**
   * Delete an order
   */
  async deleteOrder(orderId: string): Promise<void> {
    if (!this.isValidObjectId(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const result = await this.orderModel.findByIdAndDelete(orderId);
    if (!result) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
  }

  /**
   * Get all customers with pagination
   */
  async getAllCustomers(params: GetCustomersParams) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    // Get order counts for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await this.orderModel.countDocuments({
          'customer.userId': customer._id.toString(),
        });
        const totalSpent = await this.orderModel.aggregate([
          {
            $match: {
              'customer.userId': customer._id.toString(),
              isPaid: true,
            },
          },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        return {
          ...customer.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );

    return {
      customers: customersWithOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCustomers: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(limit: number = 10) {
    const topProducts = await this.orderModel.aggregate([
      { $match: { status: { $ne: OrderStatus.CANCELLED } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.posterId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'posters',
          localField: '_id',
          foreignField: '_id',
          as: 'poster',
        },
      },
      { $unwind: '$poster' },
      {
        $project: {
          _id: '$poster._id',
          title: '$poster.title',
          images: '$poster.images',
          price: '$poster.price',
          stock: '$poster.stock',
          category: '$poster.category',
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return topProducts;
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(period: string = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupBy: Record<string, unknown>;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const revenueData = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate }, isPaid: true } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      period,
      data: revenueData.map((item) => ({
        date: item._id,
        revenue: item.revenue,
        orders: item.orders,
      })),
    };
  }
}
