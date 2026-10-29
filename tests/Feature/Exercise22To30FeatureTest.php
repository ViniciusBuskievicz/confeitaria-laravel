<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Exercise22To30FeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_returns_http_200(): void
    {
        $this->get('/')->assertOk();
    }

    public function test_module_index_pages_return_http_200(): void
    {
        foreach (['/produtos', '/clientes', '/pedidos', '/entregas'] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_product_listing_displays_a_product_name(): void
    {
        Product::create($this->productData(['name' => 'Produto esperado na listagem']));

        $this->get('/produtos')->assertOk()->assertSee('Produto esperado na listagem');
    }

    public function test_unknown_route_returns_http_404(): void
    {
        $this->get('/rota-que-nao-existe')->assertNotFound();
    }

    public function test_creating_product_persists_it_in_the_database(): void
    {
        $product = Product::create($this->productData(['name' => 'Produto no banco']));

        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Produto no banco']);
    }

    public function test_valid_customer_post_redirects_and_persists_the_customer(): void
    {
        $response = $this->post('/clientes', [
            'name' => 'Cliente via POST',
            'email' => 'post@example.com',
            'phone' => '11912345678',
            'address' => 'Rua dos Testes, 10',
            'city' => 'São Paulo',
        ]);

        $response->assertRedirect('/clientes');
        $this->assertDatabaseHas('customers', ['email' => 'post@example.com', 'name' => 'Cliente via POST']);
    }

    public function test_product_post_reports_missing_name_and_invalid_price(): void
    {
        $this->from('/produtos/create')->post('/produtos', $this->productData(['name' => '']))
            ->assertSessionHasErrors(['name']);

        $this->from('/produtos/create')->post('/produtos', $this->productData(['price' => -1]))
            ->assertSessionHasErrors(['price']);
    }

    public function test_product_price_update_persists_and_customer_delete_removes_the_record(): void
    {
        $product = Product::create($this->productData(['name' => 'Produto para atualizar']));
        $customer = Customer::create(['name' => 'Cliente para excluir']);

        $this->put("/produtos/{$product->id}", $this->productData(['name' => $product->name, 'price' => 21.5]))
            ->assertRedirect('/produtos');
        $this->assertDatabaseHas('products', ['id' => $product->id, 'price' => '21.50']);

        $this->delete("/clientes/{$customer->id}")->assertRedirect('/clientes');
        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_order_creation_reduces_product_stock_by_the_ordered_quantity(): void
    {
        $customer = Customer::create(['name' => 'Cliente do pedido']);
        $product = Product::create($this->productData(['stock' => 10]));

        $this->post('/pedidos', [
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'quantity' => 3,
            'status' => 'pending',
        ])->assertRedirect('/pedidos');

        $this->assertDatabaseHas('orders', [
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 7]);
    }

    public function test_order_above_available_stock_is_rejected_without_creating_an_order(): void
    {
        $customer = Customer::create(['name' => 'Cliente sem estoque']);
        $product = Product::create($this->productData(['stock' => 2]));

        $this->from('/pedidos/create')->post('/pedidos', [
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'quantity' => 3,
            'status' => 'pending',
        ])->assertSessionHasErrors(['quantity']);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 2]);
    }

    private function productData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Produto de teste',
            'description' => 'Descrição do produto',
            'category' => 'Bolos',
            'price' => 12.5,
            'stock' => 10,
            'minimum_stock' => 2,
            'active' => true,
        ], $overrides);
    }
}
