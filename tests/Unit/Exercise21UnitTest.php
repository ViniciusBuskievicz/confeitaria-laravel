<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class Exercise21UnitTest extends TestCase
{
    public function test_exercise_21_intentionally_fails_with_assert_false_true(): void
    {
        $this->assertFalse(true);
    }
}
