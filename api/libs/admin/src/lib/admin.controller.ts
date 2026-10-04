import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Auth } from '@new-poster-parlor-api/auth';
import { UserRole, OrderStatus } from '@new-poster-parlor-api/models';
import { HttpResponseUtil } from '@new-poster-parlor-api/utils';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  /**
   * Get dashboard stats (total orders, revenue, customers, etc.)
   */
  @Get('stats')
  @Auth(UserRole.ADMIN)
  async getDashboardStats() {
    const stats = await this.adminService.getDashboardStats();
    return HttpResponseUtil.success(stats, 'Dashboard stats fetched');
  }

  /**
   * Get recent orders for dashboard
   */
  @Get('orders/recent')
  @Auth(UserRole.ADMIN)
  async getRecentOrders(@Query('limit') limit?: string) {
    const orders = await this.adminService.getRecentOrders(
      limit ? parseInt(limit, 10) : 10
    );
    return HttpResponseUtil.success(orders, 'Recent orders fetched');
  }

  /**
   * Get all orders with pagination and filters
   */
  @Get('orders')
  @Auth(UserRole.ADMIN)
  async getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    const result = await this.adminService.getAllOrders({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status: status as OrderStatus,
      search,
      sortBy,
      sortOrder,
    });
    return HttpResponseUtil.success(result, 'Orders fetched successfully');
  }

  /**
   * Get single order by ID (admin can view any order)
   */
  @Get('orders/:id')
  @Auth(UserRole.ADMIN)
  async getOrderById(@Param('id') orderId: string) {
    const order = await this.adminService.getOrderById(orderId);
    return HttpResponseUtil.success(order, 'Order fetched successfully');
  }

  /**
   * Update order status
   */
  @Patch('orders/:id/status')
  @Auth(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() body: { status: OrderStatus; trackingNumber?: string }
  ) {
    const order = await this.adminService.updateOrderStatus(
      orderId,
      body.status,
      body.trackingNumber
    );
    return HttpResponseUtil.success(order, 'Order status updated');
  }

  /**
   * Cancel an order
   */
  @Patch('orders/:id/cancel')
  @Auth(UserRole.ADMIN)
  async cancelOrder(
    @Param('id') orderId: string,
    @Body() body: { reason?: string }
  ) {
    const order = await this.adminService.cancelOrder(orderId, body.reason);
    return HttpResponseUtil.success(order, 'Order cancelled');
  }

  /**
   * Delete an order (hard delete)
   */
  @Delete('orders/:id')
  @Auth(UserRole.ADMIN)
  async deleteOrder(@Param('id') orderId: string) {
    await this.adminService.deleteOrder(orderId);
    return HttpResponseUtil.deleted('Order deleted successfully');
  }

  /**
   * Get all customers with pagination
   */
  @Get('customers')
  @Auth(UserRole.ADMIN)
  async getAllCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const result = await this.adminService.getAllCustomers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
    });
    return HttpResponseUtil.success(result, 'Customers fetched successfully');
  }

  /**
   * Get top selling products
   */
  @Get('products/top')
  @Auth(UserRole.ADMIN)
  async getTopProducts(@Query('limit') limit?: string) {
    const products = await this.adminService.getTopSellingProducts(
      limit ? parseInt(limit, 10) : 10
    );
    return HttpResponseUtil.success(products, 'Top products fetched');
  }

  /**
   * Get revenue analytics
   */
  @Get('analytics/revenue')
  @Auth(UserRole.ADMIN)
  async getRevenueAnalytics(@Query('period') period?: string) {
    const analytics = await this.adminService.getRevenueAnalytics(
      period || 'month'
    );
    return HttpResponseUtil.success(analytics, 'Revenue analytics fetched');
  }
}
